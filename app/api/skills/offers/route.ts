import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/skills/offers - Get all skill offers or filter by query params
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Extract query parameters
  const category = searchParams.get('category')
  const exchangeType = searchParams.get('exchangeType')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const radius = searchParams.get('radius') || '10' // Default 10km radius
  
  // Start building the query
  let query = supabase
    .from('skill_offers')
    .select(`
      *,
      profiles:user_id (id, full_name, profile_picture_url, average_rating),
      skill_categories:category_id (id, name)
    `)
    .eq('status', 'active')
  
  // Apply filters if provided
  if (category) {
    query = query.eq('category_id', category)
  }
  
  if (exchangeType) {
    query = query.eq('exchange_type', exchangeType)
  }
  
  // If location is provided, we would use PostGIS to filter by distance
  // This is a placeholder for the actual implementation
  if (lat && lng) {
    // In a real implementation, this would use a PostGIS query
    console.log(`Filtering by location: ${lat}, ${lng} with radius ${radius}km`)
    // Example PostGIS query would be something like:
    // query = query.filter(`ST_DWithin(geom, ST_MakePoint(${lng}, ${lat})::geography, ${radius} * 1000)`)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

// POST /api/skills/offers - Create a new skill offer
export async function POST(request: Request) {
  const body = await request.json()
  
  // In a real implementation, we would validate the request body
  // and ensure the user is authenticated
  
  const { data, error } = await supabase
    .from('skill_offers')
    .insert([
      {
        user_id: body.userId, // This would come from the authenticated user
        title: body.title,
        description: body.description,
        category_id: body.categoryId,
        exchange_type: body.exchangeType,
        price: body.price,
        currency: body.currency,
        availability_details: body.availabilityDetails,
        service_area_type: body.serviceAreaType,
        service_radius_km: body.serviceRadiusKm,
        media_urls: body.mediaUrls,
        status: 'active'
      }
    ])
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data[0], { status: 201 })
}