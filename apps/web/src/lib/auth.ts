import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    plugins: [
        username(),
    ],
    user: {
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
    databaseHooks: {
        session: {
            create: {
                before: async (session) => {
                    // Find the account for this user to get the access token
                    const account = await prisma.account.findFirst({
                        where: {
                            userId: session.userId,
                            providerId: "github",
                        },
                    });

                    if (account?.accessToken) {
                        await prisma.user.update({
                            where: { id: session.userId },
                            data: {
                                githubToken: account.accessToken,
                            },
                        });
                    }
                    return { data: session };
                },
            },
        },
    },
});