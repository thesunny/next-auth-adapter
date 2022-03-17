import type { PrismaClient, Prisma, VerificationToken } from "@prisma/client"
import * as NextAuth from "next-auth/adapters"
import { nanoid } from "nanoid"
import pick from "lodash/pick"
import { Simplify } from "type-fest"
import * as s from "superstruct"

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

// export type Session = {
//   id: string
//   sessionToken: string
//   userId: string | null
//   expires: Date
// }

const AdapterSessionStruct: s.Describe<NextAuth.AdapterSession> = s.object({
  id: s.string(),
  sessionToken: s.string(),
  userId: s.string(),
  expires: s.date(),
})

function createUser(data: Record<string, unknown>) {
  return s.create(data, UserStruct)
}

export function CustomPrismaAdapter(p: PrismaClient): NextAuth.Adapter {
  return {
    createUser($user) {
      const id = nanoid()
      const user = { id, ...createUser($user) }
      return p.user.create({ data: user })
    },
    getUser(id) {
      return p.user.findUnique({ where: { id } })
    },
    getUserByEmail(email) {
      return p.user.findUnique({ where: { email } })
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        select: { User: true },
      })
      return account?.User ?? null
    },
    updateUser({ id, ...$user }) {
      const user = createUser($user)
      return p.user.update({ where: { id }, data: user })
    },
    deleteUser(id) {
      return p.user.delete({ where: { id } })
    },
    async linkAccount(data) {
      console.log("linkAccount", data)
      const id = nanoid()
      await p.account.create({ data: { id, ...data } })
    },
    async unlinkAccount(provider_providerAccountId) {
      await p.account.delete({ where: { provider_providerAccountId } })
    },
    async getSessionAndUser(sessionToken: string) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { User: true },
      })
      if (!userAndSession) return null
      const { User, ...$session } = userAndSession
      const session = s.create($session, AdapterSessionStruct)
      return { user: User, session }
    },
    async createSession(session) {
      const id = nanoid()
      const $adapterSession = await p.session.create({
        data: { id, ...session },
      })
      const adapterSession = s.create($adapterSession, AdapterSessionStruct)
      return adapterSession
    },
    async updateSession({ sessionToken, ...data }) {
      return await p.session.update({ where: { sessionToken }, data })
    },
    async deleteSession(sessionToken): Promise<void> {
      await p.session.delete({ where: { sessionToken } })
    },
    async createVerificationToken({
      identifier,
      token,
      expires,
    }): Promise<NextAuth.VerificationToken> {
      const vt = await p.verificationToken.create({
        data: { identifier, token, expiresAt: expires },
      })
      return {
        identifier: vt.identifier,
        token: vt.token,
        expires: vt.expiresAt,
      }
    },
    async useVerificationToken(
      identifier_token
    ): Promise<NextAuth.VerificationToken | null> {
      try {
        const vt = await p.verificationToken.delete({
          where: { identifier_token },
        })
        return {
          identifier: vt.identifier,
          token: vt.token,
          expires: vt.expiresAt,
        }
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

function toAdapterVerificationToken({
  identifier,
  token,
  expiresAt,
}: VerificationToken): NextAuth.VerificationToken {
  return {
    identifier,
    token,
    expires: expiresAt,
  }
}
