import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/users/profiles - Get a user profile
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }
  
  // Get the user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }
  
  // Get the user's skill offers
  const { data: skillOffers, error: offersError } = await supabase
    .from('skill_offers')
    .select(`
      *,
      skill_categories:category_id (id, name)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
  
  if (offersError) {
    return NextResponse.json({ error: offersError.message }, { status: 500 })
  }
  
  // Get the user's skill requests
  const { data: skillRequests, error: requestsError } = await supabase
    .from('skill_requests')
    .select(`
      *,
      skill_categories:category_id (id, name)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
  
  if (requestsError) {
    return NextResponse.json({ error: requestsError.message }, { status: 500 })
  }
  
  // Get the user's reviews (as reviewee)
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:reviewer_id (id, full_name, profile_picture_url)
    `)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false })
  
  if (reviewsError) {
    return NextResponse.json({ error: reviewsError.message }, { status: 500 })
  }
  
  // Get the user's primary location
  const { data: location, error: locationError } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .single()
  
  if (locationError && locationError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    return NextResponse.json({ error: locationError.message }, { status: 500 })
  }
  
  // Combine all data
  const userData = {
    profile,
    skillOffers: skillOffers || [],
    skillRequests: skillRequests || [],
    reviews: reviews || [],
    location: location || null
  }
  
  return NextResponse.json(userData)
}

// PATCH /api/users/profiles - Update a user profile
export async function PATCH(request: Request) {
  const body = await request.json()
  
  // In a real implementation, we would validate the request body
  // and ensure the user is authenticated and can only update their own profile
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: body.fullName,
      bio: body.bio,
      profile_picture_url: body.profilePictureUrl
    })
    .eq('id', body.userId) // This would be the authenticated user's ID
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data[0])
}