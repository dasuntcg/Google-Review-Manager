import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { serialize } from 'cookie'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(code)

  // Set tokens in a secure, HTTP-only cookie
  const cookie = serialize('googTokens', JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: tokens.expiry_date ? Math.floor((tokens.expiry_date - Date.now()) / 1000) : undefined,  // seconds until expiry
  })

  return NextResponse.redirect('/', {
    headers: { 'Set-Cookie': cookie }
  })
}
