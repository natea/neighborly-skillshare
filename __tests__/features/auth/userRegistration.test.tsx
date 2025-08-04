import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistrationForm from '@/components/auth/RegistrationForm';
import { supabase } from '@/lib/supabase'; // Actual import for types, will be mocked
import { useRouter } from 'next/navigation'; // Added import

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
  },
}));

// Helper to mock supabase.auth.signUp
const mockSupabaseSignUp = supabase.auth.signUp as jest.Mock;
// Helper to mock supabase.from('profiles').insert
const mockSupabaseProfileInsert = supabase.from('profiles').insert as jest.Mock;


describe('User Registration Form (HLT-001 related)', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockSupabaseSignUp.mockReset();
    (supabase.from as jest.Mock).mockClear(); // Clear calls to supabase.from
    mockSupabaseProfileInsert.mockReset(); // Reset the insert mock specifically
    // Ensure 'from' is set up to return the insert mock again if needed by default
     (supabase.from as jest.Mock).mockReturnValue({ insert: mockSupabaseProfileInsert });
  });

  const fillForm = (email = 'test@example.com', password = 'Password123', confirmPassword = 'Password123') => {
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: password } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: confirmPassword } });
  };

  it('should allow a user to register with valid credentials and create a profile', async () => {
    render(<RegistrationForm />);
    mockSupabaseSignUp.mockResolvedValueOnce({
      data: { user: { id: 'user-id-123', email: 'test@example.com' }, session: null },
      error: null,
    });
    mockSupabaseProfileInsert.mockResolvedValueOnce({ data: [{}], error: null });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      // Check if the router was called to redirect
      expect(mockPush).toHaveBeenCalledWith('/auth/check-email');
    });
    expect(mockSupabaseSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123',
    });
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabaseProfileInsert).toHaveBeenCalledWith({
        id: 'user-id-123',
        email: 'test@example.com'
    });
  });

  it('should display error if profile creation fails after successful auth signup', async () => {
    render(<RegistrationForm />);
    mockSupabaseSignUp.mockResolvedValueOnce({
      data: { user: { id: 'user-id-123', email: 'test@example.com' }, session: null },
      error: null,
    });
    mockSupabaseProfileInsert.mockResolvedValueOnce({ data: null, error: { message: 'Profile creation failed', name: 'ProfileError', status: 500 } });

    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText('Registration succeeded, but failed to create user profile. Please contact support.')).toBeInTheDocument();
    });
  });

  // it('should validate email format during registration', async () => {
  //   render(<RegistrationForm />);
  //   fillForm('invalid-email', 'Password123', 'Password123');
  //   fireEvent.click(screen.getByRole('button', { name: /Register/i }));

  //   await waitFor(() => {
  //     expect(screen.getByText('Invalid email format.')).toBeInTheDocument();
  //   });
  //   expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  // });

  it('should validate email format during registration', async () => {
    render(<RegistrationForm />);
    fillForm('invalid-email', 'Password123', 'Password123');
    
    // Explicitly blur the email field to trigger onBlur validation
    await act(async () => {
      fireEvent.blur(screen.getByLabelText(/Email/i));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });

    // Debugging: Print the DOM structure
    // screen.debug(undefined, 30000); // Increase size limit for debug output

    expect(await screen.findByText('Invalid email format.')).toBeInTheDocument();
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });

  it('should require email and show error on blur', async () => {
    render(<RegistrationForm />);
    const emailInput = screen.getByLabelText(/Email/i);
    
    // Ensure input is empty then trigger blur
    fireEvent.change(emailInput, { target: { value: 'temporary' } }); // Set some value
    fireEvent.change(emailInput, { target: { value: '' } });      // Clear it
    
    await act(async () => {
      fireEvent.blur(emailInput);                                   // Trigger blur
    });

    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    
    // Check that submitting afterwards doesn't clear the error or submit
    const submitButton = screen.getByRole('button', { name: /Register/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(await screen.findByText('Email is required.')).toBeInTheDocument(); // Error should persist
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });


  it('should require password to meet strength requirements (min 8 chars)', async () => {
    render(<RegistrationForm />);
    fillForm('test@example.com', 'Pass1', 'Pass1');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });
    expect(await screen.findByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });

  it('should require password to meet strength requirements (lowercase)', async () => {
    render(<RegistrationForm />);
    fillForm('test@example.com', 'PASSWORD123', 'PASSWORD123');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });
    expect(await screen.findByText('Password must contain at least one lowercase letter.')).toBeInTheDocument();
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });

  it('should require password to meet strength requirements (uppercase)', async () => {
    render(<RegistrationForm />);
    fillForm('test@example.com', 'password123', 'password123');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });
    expect(await screen.findByText('Password must contain at least one uppercase letter.')).toBeInTheDocument();
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });

  it('should require password to meet strength requirements (number)', async () => {
    render(<RegistrationForm />);
    fillForm('test@example.com', 'PasswordSTRONG', 'PasswordSTRONG');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });
    expect(await screen.findByText('Password must contain at least one number.')).toBeInTheDocument();
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });
it('should require password', async () => {
  render(<RegistrationForm />);
  fillForm('test@example.com', '', 'Password123'); // Password empty
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  });
  expect(await screen.findByText('Password is required.')).toBeInTheDocument();
  expect(mockSupabaseSignUp).not.toHaveBeenCalled();
});

it('should require confirm password', async () => {
  render(<RegistrationForm />);
  fillForm('test@example.com', 'Password123', ''); // Confirm password empty
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  });
  expect(await screen.findByText('Confirm Password is required.')).toBeInTheDocument();
  expect(mockSupabaseSignUp).not.toHaveBeenCalled();
});

  it('should require confirm password to match password', async () => {
    render(<RegistrationForm />);
    fillForm('test@example.com', 'Password123', 'Password456');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    });
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSupabaseSignUp).not.toHaveBeenCalled();
  });

  it('should prevent registration with existing email (server error)', async () => {
    render(<RegistrationForm />);
    mockSupabaseSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered', name: 'AuthApiError', status: 400 },
    });

    fillForm('existing@example.com', 'Password123', 'Password123');
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText('User already registered')).toBeInTheDocument();
    });
    expect(mockSupabaseSignUp).toHaveBeenCalledWith({
      email: 'existing@example.com',
      password: 'Password123',
    });
    expect(mockSupabaseProfileInsert).not.toHaveBeenCalled();
  });
  
  it('should display a generic server error if signUp fails unexpectedly', async () => {
    render(<RegistrationForm />);
    mockSupabaseSignUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'An unexpected server error occurred', name: 'AuthApiError', status: 500 },
    });
  
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  
    await waitFor(() => {
      expect(screen.getByText('An unexpected server error occurred')).toBeInTheDocument();
    });
    expect(mockSupabaseSignUp).toHaveBeenCalled();
    expect(mockSupabaseProfileInsert).not.toHaveBeenCalled();
  });

  // The original HLT-001 also mentions verification email, profile completion, and general auth.
  // These are out of scope for the RegistrationForm component itself but are listed for context.
  describe('Related HLT-001 aspects (covered by other tests/components)', () => {
    it.todo('should send verification email after successful registration (handled by Supabase)');
    it.todo('should allow users to upload a profile photo');
    it.todo('should allow users to set their location with address validation');
    it.todo('should allow users to add skills they can offer');
    it.todo('should allow users to add skills they need');
    it.todo('should allow users to set privacy preferences');
    it.todo('should display profile completion percentage');
    it.todo('should allow users to log in with valid credentials');
    it.todo('should prevent login with invalid credentials');
    it.todo('should allow users to reset their password');
    it.todo('should maintain user session after successful login');
  });
});