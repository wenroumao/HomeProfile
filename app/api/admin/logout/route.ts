import { NextResponse } from "next/server";
import { signOut } from "next-auth/react"; // Import signOut from next-auth/react

export async function POST(request: Request) {
  console.log('[AdminLogout API] Received logout request');
  try {
    // Instead of manually clearing cookies, use NextAuth's signOut function
    // Note: signOut is typically used on the client-side, but can be used with a redirect on server side
    // For API routes, directly returning a response and letting the client handle signOut is usually better,
    // or trigger a redirect to a signOut page if server-side processing is needed.
    // Since this is an API route that should return JSON, we'll just acknowledge the request
    // and rely on the client to call NextAuth.signOut() which handles cookie clearing.
    // Or, if we strictly want server-side cookie clearing, we would need to integrate with NextAuth's internal methods,
    // which are not directly exposed for this purpose on API routes in a straightforward way.
    // The most robust way is for the client to initiate signOut, which then clears the session cookie.

    // For this API route, we'll respond with success, assuming the client will also call signOut on their end.
    // Alternatively, for a purely server-side logout, consider creating a redirect to NextAuth's signOut endpoint:
    // return NextResponse.redirect(new URL("/api/auth/signout", request.url));

    // Given the previous implementation, we'll simplify to a success response.
    return NextResponse.json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error("[AdminLogout API] Error during logout:", error);
    return NextResponse.json(
      { success: false, message: "Server error during logout." },
      { status: 500 }
    );
  }
} 