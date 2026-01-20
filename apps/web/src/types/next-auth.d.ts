import 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    githubId?: string
    user?: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    githubId?: string
  }
}
