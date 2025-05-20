import type { APIRoute } from "astro";
// import { sign } from "jsonwebtoken";
import pkg from "jsonwebtoken";
const { sign } = pkg;

export const GET: APIRoute = async ({ request, cookies }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const BASE_URL = import.meta.env.BASE_URL;
  if (!BASE_URL || !code) throw new Error("Something went wrong: 10");

  const stateFromGoogle = url.searchParams.get("state");
  const storedState = cookies.get("oauth_state")?.value;
  if (!storedState || !stateFromGoogle || storedState !== stateFromGoogle)
    throw new Error("Something went wrong: 11");
  cookies.delete("oauth_state", { path: "/" });

  const { access_token: accessToken } = await exchangeCodeForTokens(code);
  const { name, email } = await getUserInfo(accessToken);

  if (!import.meta.env.JSONWEBTOKEN_SECRET)
    throw new Error("Something went wrong: 12");
  console.log({ name, email });
  const token = sign({ name, email }, import.meta.env.JSONWEBTOKEN_SECRET!, {
    expiresIn: "1d",
  });

  const headers = new Headers();

  headers.append("Location", BASE_URL);
  // headers.append("Set-Cookie", `Authorization=Bearer ${token}`);
  cookies.set("Authorization", `Bearer ${token}`, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    path: "/",
    maxAge: 24 * 60 * 60,
    sameSite: "lax",
  });

  return new Response(null, {
    status: 302,
    headers,
  });
};

async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
}> {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const data = new URLSearchParams();
  data.append("code", code);
  data.append("client_id", import.meta.env.GOOGLE_CLIENT_ID!);
  data.append("client_secret", import.meta.env.GOOGLE_CLIENT_SECRET!);
  data.append("redirect_uri", `http"//localhost:4321/auth-google-callback`);
  data.append("grant_type", "authorization_code");

  const response = await (
    await fetch(tokenUrl, {
      method: "POST",
      body: data,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  ).json();
  console.log({ res: await response });
  return await response;
}

async function getUserInfo(
  accessToken: string
): Promise<{ email: string; name: string }> {
  const userInfoUrl = "https://www.googleapis.com/oauth2/v1/userinfo";
  const response = await fetch(userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await userInfoResponse.json();
}
