import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ cookies }) => {
  const GOOGLE_CLIENT_ID = import.meta.env.GOOGLE_CLIENT_ID;
  const GOOGLE_STATE = import.meta.env.GOOGLE_STATE!;
  const BASE_URL = import.meta.env.BASE_URL;

  if (!GOOGLE_CLIENT_ID || !BASE_URL || !GOOGLE_STATE)
    throw new Error("Something went wrong: 9");

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${BASE_URL}/auth-google-callback&` +
    `response_type=code&` +
    `scope=profile email&`;

  cookies.set("oauth_state", GOOGLE_STATE, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: 15 * 60,
    sameSite: "lax",
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
    },
  });
};
