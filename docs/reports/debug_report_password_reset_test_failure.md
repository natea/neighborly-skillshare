# Debug Report: Failing Test in Password Reset Flow

**Date:** 2025-05-20
**Feature Being Debugged:** Password Reset - Reset Password Form
**Failing Test File:** [`__tests__/features/auth/passwordReset.test.tsx`](__tests__/features/auth/passwordReset.test.tsx)
**Component File:** [`components/auth/ResetPasswordForm.tsx`](components/auth/ResetPasswordForm.tsx)

## 1. Failing Test Identification

The test named `"ResetPasswordForm Component › displays an error message if supabase.auth.updateUser fails"` located in the test file [`__tests__/features/auth/passwordReset.test.tsx`](__tests__/features/auth/passwordReset.test.tsx) is failing.

The test assertion that fails is:
```typescript
// In __tests__/features/auth/passwordReset.test.tsx
await waitFor(() => {
  expect(screen.getByText(/update user error!/i)).toBeInTheDocument();
});
```
The test times out, unable to find the "Update user error!" message.

## 2. Steps Taken to Reproduce and Diagnose

1.  **Reviewed Code:** The test file ([`__tests__/features/auth/passwordReset.test.tsx`](__tests__/features/auth/passwordReset.test.tsx)) and the component file ([`components/auth/ResetPasswordForm.tsx`](components/auth/ResetPasswordForm.tsx)) were reviewed to understand the test setup, component logic, and error handling.
2.  **Executed Test:** The test was run using the command `npm test -- __tests__/features/auth/passwordReset.test.tsx`.
3.  **Analyzed Test Output:** The Jest output confirmed the failure: `Unable to find an element with the text: /update user error!/i`. The DOM snapshot provided at the time of failure showed that the error message paragraph was not present.
4.  **Hypothesized Cause:** Initial hypotheses revolved around general timing issues with asynchronous state updates. Further analysis focused on the interaction between the `onSubmit` handler (which sets the error on `updateUser` failure) and the `useEffect` hook that manages `onAuthStateChange` and initial session verification.

## 3. Root Cause Explanation

The root cause of the test failure is a race condition within the test environment, specifically due to the interaction of the `onAuthStateChange` mock defined in the `beforeEach` block for the "ResetPasswordForm Component" tests and the asynchronous operations within the component and the test itself.

**Detailed Breakdown:**

1.  **`beforeEach` Mock Setup:** The `beforeEach` block at [`__tests__/features/auth/passwordReset.test.tsx:106`](__tests__/features/auth/passwordReset.test.tsx) mocks `supabase.auth.onAuthStateChange`. This mock simulates a `PASSWORD_RECOVERY` event asynchronously:
    ```typescript
    (supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      Promise.resolve().then(() => callback('PASSWORD_RECOVERY', { user: { id: '123' } }));
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    ```
2.  **Component Logic for `PASSWORD_RECOVERY`:** In [`components/auth/ResetPasswordForm.tsx`](components/auth/ResetPasswordForm.tsx), when the `onAuthStateChange` callback receives a `PASSWORD_RECOVERY` event with a valid session, it calls `setError(null)` (line 58):
    ```typescript
    // In components/auth/ResetPasswordForm.tsx
    if (event === 'PASSWORD_RECOVERY') {
      recoveryEventHandled = true;
      if (session) {
        console.log('Password recovery event: Session established.');
        setError(null); // Clears any existing error
      } else {
        setError('Invalid or expired password reset link...');
      }
    }
    ```
    This behavior is generally correct for the component at runtime – a successful password recovery event should clear prior errors.

3.  **Test Execution Flow for Failing Test:**
    a.  The component renders. The `useEffect` hook sets up the `onAuthStateChange` listener. The mock schedules the `PASSWORD_RECOVERY` event (and thus the `setError(null)` call) to occur as a microtask.
    b.  The test waits for initial rendering (e.g., "Verifying reset link..." to disappear).
    c.  The test then simulates user input and a click on the "Reset Password" button. This triggers the `onSubmit` handler in the component.
    d.  Inside `onSubmit`, `supabase.auth.updateUser` is mocked to fail, and `setError('Update user error!')` is called. This correctly sets the error state, and the component should re-render with the error message.
    e.  The `await act(async () => { fireEvent.click(...) });` block in the test waits for the `onSubmit` promise to resolve and associated state updates to flush.

4.  **The Race Condition:** The `setError(null)` call, triggered by the mocked `onAuthStateChange`'s `PASSWORD_RECOVERY` event, is also an asynchronous operation (scheduled via `Promise.resolve().then()`). If this microtask executes *after* `onSubmit` has set `setError('Update user error!')` but *before* the `await waitFor(...)` assertion in the test can consistently find the error message, the error message will be cleared from the state, and the test will fail.

Essentially, the `setError(null)` from the general `PASSWORD_RECOVERY` simulation (intended to set up a clean state for other tests) inadvertently clears the specific error message ("Update user error!") that *this* particular test is trying to verify.

## 4. Recommendations to Fix

The primary goal is to ensure that the error state set by `onSubmit` is stable and observable by the test's assertions, without being prematurely cleared by unrelated setup logic from `onAuthStateChange`.

**Recommended Fix (Modify Test Logic):**

The most straightforward fix is to ensure that any asynchronous effects from the initial `onAuthStateChange` mock (specifically the `setError(null)` call) have fully completed *before* the test proceeds to interact with the form and trigger the `onSubmit` handler.

Add a step to flush pending microtasks after the initial render and before interacting with the form:

```typescript
// In __tests__/features/auth/passwordReset.test.tsx
// Inside the failing test case: "displays an error message if supabase.auth.updateUser fails"

it('displays an error message if supabase.auth.updateUser fails', async () => {
  (supabase.auth.updateUser as jest.Mock).mockResolvedValueOnce({
    data: null,
    error: { message: 'Update user error!' },
  });

  render(<ResetPasswordForm />);

  // Wait for the initial "Verifying reset link..." to disappear
  await waitFor(() => expect(screen.queryByText(/verifying reset link.../i)).not.toBeInTheDocument());

  // Add this to allow pending microtasks from onAuthStateChange (like setError(null)) to complete
  // This ensures that the setError(null) from the PASSWORD_RECOVERY event simulation in beforeEach
  // has a chance to execute and settle before we proceed with the test's main actions.
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0)); // Or await Promise.resolve();
  });

  fireEvent.change(screen.getByLabelText(/^new password$/i), { target: { value: 'NewPassword123' } });
  fireEvent.change(screen.getByLabelText(/^confirm new password$/i), { target: { value: 'NewPassword123' } });
  
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
  });

  await waitFor(() => {
    expect(screen.getByText(/update user error!/i)).toBeInTheDocument();
  });
});
```
Using `await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); });` or `await act(async () => { await Promise.resolve(); });` should give the event loop a chance to process pending microtasks, including the one from the `onAuthStateChange` mock that calls `setError(null)`. This way, the `setError(null)` happens first, then `onSubmit` sets `setError('Update user error!')`, which should then be stable for `waitFor` to detect.

**Alternative (If the above is insufficient):**

If simply flushing microtasks isn't consistently effective, a more targeted approach for this specific test would be to temporarily override or adjust the `onAuthStateChange` mock *within this test case* to prevent it from calling `setError(null)`. However, this makes the test setup more divergent from other tests in the suite. The microtask flush is generally preferred if it works.

**Component Code Consideration:**

No changes are recommended for the component code ([`components/auth/ResetPasswordForm.tsx`](components/auth/ResetPasswordForm.tsx)) itself based on this diagnosis. The component's logic to call `setError(null)` upon a successful `PASSWORD_RECOVERY` event ([`components/auth/ResetPasswordForm.tsx:58`](components/auth/ResetPasswordForm.tsx:58)) is sound for its runtime behavior. The issue identified is specific to the test environment's timing and mock interactions.

## 5. Confirmation of Component's Runtime Logic

The component's runtime logic for the error path (displaying an error message when `supabase.auth.updateUser` fails) appears to be fundamentally correct. The `onSubmit` handler appropriately calls `setError(updateError.message)`, and the component renders this error via `{error && <p className="mt-4 text-sm text-red-600">{error}</p>}`.

The test failure is not indicative of a bug in this specific error display mechanism within `onSubmit` but rather an artifact of the test setup's interaction with the component's `onAuthStateChange` handling. In a real runtime scenario where an `updateUser` call fails, and no immediate, overriding `PASSWORD_RECOVERY` event occurs, the error message set by `onSubmit` should be displayed as intended.