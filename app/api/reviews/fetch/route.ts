// app/api/reviews/fetch/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { parse } from 'cookie'
import { Review } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    // 1. Read OAuth tokens from our secure cookie
    const cookieHeader = request.headers.get('cookie') || ''
    const { googTokens } = parse(cookieHeader)
    if (!googTokens) {
      return NextResponse.json(
        { message: 'Not authenticated. Please sign in first.' },
        { status: 401 }
      )
    }

    // 2. Parse and set credentials
    let tokens: any
    try {
      tokens = JSON.parse(googTokens)
    } catch {
      return NextResponse.json(
        { message: 'Invalid token data. Please re-authenticate.' },
        { status: 400 }
      )
    }
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials(tokens)

    // 3. Hard-code your account & location IDs here
    const accountId  = 'YOUR_ACCOUNT_ID'   // ← e.g. '1234567890'
    const locationId = 'YOUR_LOCATION_ID'  // ← e.g. '0987654321'

    // 4. Initialise the Business Profile API client
    const mybusiness = google.mybusiness({ version: 'v4', auth: oauth2Client })

    // 5. Fetch the reviews, newest first
    const res = await mybusiness.accounts.locations.reviews.list({
      parent: `accounts/${accountId}/locations/${locationId}`,
      pageSize: 50,
      orderBy: 'updateTime desc',
    })
    const rawReviews = res.data.reviews || []

    // 6. Map into your Review type and add status/dateAdded
    const reviewsWithStatus: Review[] = rawReviews.map(r => ({
      ...r,
      id:         r.reviewId ?? String(Date.now()),
      status:     'new',
      dateAdded:  new Date().toISOString(),
    }))

    // 7. Return in the same shape as before
    return NextResponse.json({
      html_attributions: [] as string[],
      result: { reviews: reviewsWithStatus },
      status: 'OK',
    })
  } catch (err) {
    console.error('Error fetching reviews:', err)
    return NextResponse.json(
      { message: 'Failed to fetch reviews', error: (err as Error).message },
      { status: 500 }
    )
  }
}
