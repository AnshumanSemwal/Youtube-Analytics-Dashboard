import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";

export class TokenRefreshError extends Error {
  constructor() {
    super("Token refresh failed");
    this.name = "TokenRefreshError";
  }
}

export async function getValidAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account) throw new TokenRefreshError();

  // Decrypt stored tokens before use
  const accessToken  = account.access_token  ? decrypt(account.access_token)  : null;
  const refreshToken = account.refresh_token ? decrypt(account.refresh_token) : null;

  // Check expiry with the decrypted access token
  const now       = Math.floor(Date.now() / 1000);
  const isExpired = account.expires_at ? account.expires_at < now : true;

  if (!isExpired && accessToken) {
    return accessToken;
  }

  if (!refreshToken) throw new TokenRefreshError();

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) throw new TokenRefreshError();

    // Encrypt the new access token before storing
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: encrypt(credentials.access_token),
        expires_at:   credentials.expiry_date
          ? Math.floor(credentials.expiry_date / 1000)
          : null,
      },
    });

    // Return plaintext to callers — only the DB gets the encrypted version
    return credentials.access_token;

  } catch (error) {
    if (error instanceof TokenRefreshError) throw error;
    throw new TokenRefreshError();
  }
}