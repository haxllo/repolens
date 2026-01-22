import GithubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import prisma from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('Auth: Attempting sign in', { 
        email: user.email, 
        provider: account?.provider,
        hasProfile: !!profile,
        profileId: (profile as any)?.id
      });
      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Auth: Database connection verified');
      } catch (e: any) {
        console.error('Auth: Database connection failed!', {
          message: e.message,
          stack: e.stack
        });
        return false;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // On first sign in, 'user' is the database user object
      if (user) {
        token.id = user.id;
      }
      if (account) {
        token.accessToken = account.access_token;
        token.githubId = (profile as any)?.id?.toString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.accessToken = token.accessToken as string;
        session.githubId = token.githubId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin', // Redirect back to signin on error
  },
  session: {
    strategy: 'jwt',
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      console.log('NextAuth Debug:', code, metadata);
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('Auth Event: User signed in', { userId: user.id });
    },
    async createUser({ user }) {
      console.log('Auth Event: User created in DB', { userId: user.id });
    },
    async linkAccount({ user, account }) {
      console.log('Auth Event: Account linked in DB', { userId: user.id, provider: account.provider });
    },
  },
}
