import type { PrismaClient, Prisma } from "@prisma/client"
import * as NextAuth from "next-auth/adapters"
import { customAlphabet } from "nanoid"
import * as s from "superstruct"
import { generateUsernameFromEmail } from "./generate-username-from-email"
import { alphanumeric, numbers } from "nanoid-dictionary"

/**
 * Create an Adapter
 * https://next-auth.js.org/tutorials/creating-a-database-adapter
 *
 * PrismaAdapter
 * https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts
 * https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/prisma/schema.prisma
 * https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/prisma/custom.prisma
 *
 * GitHub profile shape
 * https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/github.js
 *
 * { id, name, email, image }
 *
 * Google profile shape
 * https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/google.ts
 * { id, name, email, image }
 */

const UserStruct = s.object({
  name: s.string(),
  email: s.string(),
  emailVerified: s.nullable(s.date()),
  image: s.nullable(s.string()),
})

const AdapterSessionStruct: s.Describe<NextAuth.AdapterSession> = s.object({
  id: s.string(),
  sessionToken: s.string(),
  userId: s.string(),
  expires: s.date(),
})

const randomDigits = customAlphabet(numbers)
const randomId = customAlphabet(alphanumeric)

export function CustomPrismaAdapter(p: PrismaClient): NextAuth.Adapter {
  return {
    async createUser($user) {
      if (typeof $user.email === "undefined") {
        throw new Error(`email is required`)
      }
      const user = s.create($user, UserStruct)
      /**
       * Generates a base username from the username in the email address
       */
      const baseUsername = generateUsernameFromEmail(user.email)
      /**
       * Starts with baseUsername and if it exists already, adds a random digits
       * to the end of it. It tries up to 10x with increasing number of random
       * digits. If we don't find one by 1,000,000,000 then there's probably
       * something wrong with the code.
       */
      let id = baseUsername
      for (let i = 0; i < 10; i++) {
        const userExists = await p.user.findUnique({
          select: { id: true },
          where: { id: id },
        })
        if (userExists == null) break
        id = `${baseUsername}${randomDigits(i + 1)}`
      }
      return await p.user.create({ data: { id: id, ...user } })
    },
    async getUser(id) {
      return await p.user.findUnique({ where: { id } })
    },
    async getUserByEmail(email) {
      return await p.user.findUnique({ where: { email } })
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const account = await p.nextAuthAccount.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        select: { User: true },
      })
      return account?.User ?? null
    },
    async updateUser({ id, ...$user }) {
      const user = s.create($user, s.partial(UserStruct))
      return await p.user.update({ where: { id }, data: user })
    },
    async deleteUser(id) {
      return await p.user.delete({ where: { id } })
    },
    async linkAccount(data) {
      const id = randomId()
      await p.nextAuthAccount.create({ data: { id, ...data } })
    },
    async unlinkAccount(provider_providerAccountId) {
      await p.nextAuthAccount.delete({ where: { provider_providerAccountId } })
    },
    async getSessionAndUser(sessionToken: string) {
      const userAndSession = await p.nextAuthSession.findUnique({
        where: { sessionToken },
        include: { User: true },
      })
      if (!userAndSession) return null
      const { User, ...$session } = userAndSession
      const session = s.create($session, AdapterSessionStruct)
      return { user: User, session }
    },
    async createSession(session) {
      const id = randomId()
      const $adapterSession = await p.nextAuthSession.create({
        data: { id, ...session },
      })
      const adapterSession = s.create($adapterSession, AdapterSessionStruct)
      return adapterSession
    },
    async updateSession({ sessionToken, ...sessionWithoutToken }) {
      return await p.nextAuthSession.update({
        where: { sessionToken },
        data: sessionWithoutToken,
      })
    },
    async deleteSession(sessionToken): Promise<void> {
      await p.nextAuthSession.delete({ where: { sessionToken } })
    },
    async createVerificationToken(
      verificationToken
    ): Promise<NextAuth.VerificationToken> {
      return await p.nextAuthVerificationToken.create({
        data: verificationToken,
      })
    },
    async useVerificationToken(
      identifier_token
    ): Promise<NextAuth.VerificationToken | null> {
      try {
        const verificationToken = await p.nextAuthVerificationToken.delete({
          where: { identifier_token },
        })
        return verificationToken
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025") {
          return null
        } else {
          throw error
        }
      }
    },
  }
}
