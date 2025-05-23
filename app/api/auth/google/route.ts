import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',           // request refresh token
    prompt: 'consent',                // force approval screen
    scope: [
      'https://www.googleapis.com/auth/business.manage',
      // add other scopes your API needs
    ],
  })

  return NextResponse.redirect(authUrl)
}
