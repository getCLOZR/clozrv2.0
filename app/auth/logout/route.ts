/**
 * Logout route. Clears session and redirects to marketing or login.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Clear session/cookies, then redirect
  return NextResponse.json({ todo: "logout" });
}

export async function POST() {
  return NextResponse.json({ todo: "logout" });
}
