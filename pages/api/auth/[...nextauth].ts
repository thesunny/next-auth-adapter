import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { getStaticEnv } from "@thesunny/get-env"
import { CustomPrismaAdapter } from "~/lib/next-auth-adapter"
import { prisma } from "~/lib/prisma"

const env = getStaticEnv({
  NEXT_AUTH_GITHUB_CLIENT_ID: process.env.NEXT_AUTH_GITHUB_CLIENT_ID,
  NEXT_AUTH_GITHUB_CLIENT_SECRET: process.env.NEXT_AUTH_GITHUB_CLIENT_SECRET,
  NEXT_AUTH_GOOGLE_CLIENT_ID: process.env.NEXT_AUTH_GOOGLE_CLIENT_ID,
  NEXT_AUTH_GOOGLE_CLIENT_SECRET: process.env.NEXT_AUTH_GOOGLE_CLIENT_SECRET,
})

export default NextAuth({
  adapter: CustomPrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: env.NEXT_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.NEXT_AUTH_GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: env.NEXT_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.NEXT_AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
})
