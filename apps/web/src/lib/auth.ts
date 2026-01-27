import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET || "BUILD_TIME_SECRET_FALLBACK",
    trustHost: true,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            // Ensure redirect happens correctly
            redirectURI: process.env.BETTER_AUTH_URL + "/api/auth/callback/github",
        },
    },
    plugins: [
        username(),
    ],
    user: {
        username: {
            enabled: true,
        },
        additionalFields: {
            githubId: {
                type: "string",
                required: false,
            },
            githubToken: {
                type: "string",
                required: false,
            },
        },
    },
    logger: {
        level: "debug",
    },
});