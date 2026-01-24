import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // Use the frontend URL for authentication handlers, NOT the API Gateway URL.
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"),
});
