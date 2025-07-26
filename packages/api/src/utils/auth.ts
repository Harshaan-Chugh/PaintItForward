import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(authHeader: string) {
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("No token");
  
  const ticket = await client.verifyIdToken({ 
    idToken: token, 
    audience: process.env.GOOGLE_CLIENT_ID 
  });
  
  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Invalid token");
  
  return { 
    email: payload.email, 
    name: payload.name || "" 
  };
}