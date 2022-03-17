import { Adapter } from "next-auth/adapters"
import { Simplify } from "type-fest"

/**
 * Resources
 *
 * - [Prisma Adapter](https://github.com/nextauthjs/next-auth/blob/main/packages/adapter-prisma/src/index.ts)
 * - [GitHub User](https://github.com/nextauthjs/next-auth/blob/main/packages/next-auth/src/providers/github.js)
 */
type AuthUser = {
  id: string
  name?: string
  email?: string
  image?: string
}

type User = {
  id: string
  name: string
  email: string
  image?: string
}

/**
 *
 * @returns
 */

const MyAdapter = function () {
  const config: Adapter = {
    async createUser(user) {
      type User = Simplify<typeof user>
      return user
    },
  }
}
