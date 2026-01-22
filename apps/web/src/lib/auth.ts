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
    async jwt({ token, account, profile }) {
      if (account) {
        console.log('SignIn Callback: Account linked', { provider: account.provider });
        token.accessToken = account.access_token
        token.githubId = (profile as any)?.id?.toString()
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
        session.accessToken = token.accessToken
        session.githubId = token.githubId
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log('SignIn Event: Success', { userId: user.id });
    },
    async createUser({ user }) {
      console.log('User Created:', { userId: user.id });
    },
  },
}
