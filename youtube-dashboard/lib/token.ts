import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

// ─── Custom error for token refresh failures ──────────────────────────────
// Using a custom class lets callers identify this specific failure
// and handle it differently from other errors (e.g. redirect to /reconnect)

export class TokenRefreshError extends Error {
  constructor() {
    super("Token refresh failed. User must sign in again.");
    this.name = "TokenRefreshError";
  }
}

// ─── Get a valid access token for a user ─────────────────────────────────
// Checks if the stored token is still valid.
// If expired, automatically refreshes it using the refresh token.
// If refresh fails, throws TokenRefreshError.

export async function getValidAccessToken(userId: string): Promise<string> {
  // Step 1: fetch the user's stored OAuth account from the database
  const account = await prisma.account.findFirst({
    where: {
      userId,
      provider: "google",
    },
  });

  if (!account) {
    throw new TokenRefreshError();
  }

  // Step 2: check if the stored access token is still valid
  // expires_at is stored as a Unix timestamp in seconds
  const now = Math.floor(Date.now() / 1000);
  const isExpired = account.expires_at
    ? account.expires_at < now
    : true;

  if (!isExpired && account.access_token) {
    // Token is still valid — return it directly
    return account.access_token;
  }

  // Step 3: token is expired — use refresh token to get a new one
  if (!account.refresh_token) {
    throw new TokenRefreshError();
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: account.refresh_token,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new TokenRefreshError();
    }

    // Step 4: save the new token back to the database
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: credentials.access_token,
        expires_at: credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : null,
      },
    });

    return credentials.access_token;

  } catch (error) {
    // If it's already a TokenRefreshError, rethrow it as-is
    if (error instanceof TokenRefreshError) {
      throw error;
    }
    // Any other error during refresh means we can't recover
    throw new TokenRefreshError();
  }
}