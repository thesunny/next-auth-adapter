import { AssertType } from "@thesunny/assert-type"
import * as NextAuth from "next-auth"
import * as Adapters from "next-auth/adapters"
import { ConditionalExcept, Except, Simplify } from "type-fest"
import * as Prisma from "@prisma/client"

// provider: "github",
// providerAccountId: randomUUID(),
// type: "oauth",
// access_token: randomUUID(),
// expires_at: ONE_MONTH,
// id_token: randomUUID(),
// refresh_token: randomUUID(),
// token_type: "bearer",
// scope: "user",
// session_state: randomUUID(),

type S = Simplify<Account>
type T = Exclude<S, Record<string, unknown>>

type TestAccount = Simplify<ConditionalExcept<Account, unknown>>

type GitHubAccount = {
  provider: "github"
  type: "oauth"
  providerAccountId: string
  access_token: string
  token_type: string
  scope: string
  userId: string
}

const accountMap = {
  provider: "provider",
  type: "type",
  providerAccountId: "providerAccountId",
  access_token: "accessToken",
  token_type: "tokenType",
  scope: "scope",
  userId: "userId",
}

type RemoveIndex<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K]
}
type KnownKeys<T> = keyof RemoveIndex<T>

type DefaultAccount = Pick<NextAuth.Account, KnownKeys<NextAuth.Account>>
type DefaultSession = Pick<NextAuth.Session, KnownKeys<NextAuth.Session>>

type GoogleAccount = {
  provider: "google"
  type: "oauth"
  providerAccountId: string
  access_token: string
  token_type: string
  scope: string
  userId: string
  expires_at: number
  id_token: string
}

AssertType.Extends<GitHubAccount, NextAuth.Account>(true)
AssertType.Extends<GoogleAccount, NextAuth.Account>(true)

// NextAuth.DefaultAccount

//   access_token?: string;
//   token_type?: string;
//   id_token?: string;
//   refresh_token?: string;
//   scope?: string;

//   expires_at?: number;
//   session_state?: string;

type Account = GitHubAccount | GoogleAccount

/**
 * Sample actual account data with secrets replaced
 */
const gitHubAccount: GitHubAccount = {
  provider: "github",
  type: "oauth",
  providerAccountId: "numberAsString",
  access_token: "string",
  token_type: "bearer",
  scope: "read:user,user:email",
  userId: "string",
}

const googleLinkAccount: GoogleAccount = {
  provider: "google",
  type: "oauth",
  providerAccountId: "numberAsString",
  access_token: "string",
  expires_at: 1647502980,
  scope:
    "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  token_type: "Bearer",
  id_token: "string",
  userId: "string",
}

/**
 * Maps from NextAuth to Database
 */
const ACCOUNT_MAP: Record<keyof DefaultAccount, keyof Prisma.Account> = {
  provider: "provider",
  type: "type",
  providerAccountId: "providerAccountId",
  access_token: "accessToken",
  token_type: "tokenType",
  scope: "scope",
  userId: "userId",
  expires_at: "expiresAt",
  id_token: "idToken",
  refresh_token: "refreshToken",
  session_state: "sessionState",
}

const SESSION_MAP: Record<keyof Adapters.AdapterSession, keyof Prisma.Session> =
  {
    id: "id",
    sessionToken: "sessionToken",
    userId: "userId",
    expires: "expiresAt",
  }

const VERIFICATION_TOKEN_MAP: Record<
  keyof Adapters.VerificationToken,
  keyof Prisma.VerificationToken
> = {
  identifier: "identifier",
  expires: "expiresAt",
  token: "token",
}
