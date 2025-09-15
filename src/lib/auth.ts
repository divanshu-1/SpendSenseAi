import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      return session
    },
    async jwt({ token, user }: any) {
      return token
    },
  },
  pages: {
    signIn: '/',
  }
}

export const getSession = () => getServerSession(authOptions)
