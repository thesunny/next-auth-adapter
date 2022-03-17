import { Knex } from "knex"
import { TIMESTAMP_OPTIONS } from "../utils"

export async function up(knex: Knex) {
  /**
   * The User table is a table that belongs to our app but that NextAuth also
   * ties into.
   *
   * Because it is something we use, we add the `createdAt` and `updatedAt`
   * fields.
   */
  await knex.schema.createTable("User", function (table) {
    table.text("id").notNullable().unique().primary()
    table.text("name").notNullable()
    table.text("email").notNullable().unique()
    table.timestamp("emailVerified", TIMESTAMP_OPTIONS)
    table.text("image")
    /**
     * Custom fields
     */
    table
      .timestamp("createdAt", TIMESTAMP_OPTIONS)
      .notNullable()
      .defaultTo(knex.fn.now())
    table
      .timestamp("updatedAt", TIMESTAMP_OPTIONS)
      .notNullable()
      .defaultTo(knex.fn.now())
  })

  await knex.schema.createTable("NextAuthAccount", function (table) {
    table.text("id").notNullable().unique().primary()
    table.text("userId").notNullable().references("User.id").onDelete("CASCADE")
    table.text("type").notNullable()
    table.text("provider").notNullable()
    table.text("providerAccountId").notNullable()
    table.text("refresh_token")
    table.text("access_token")
    table.integer("expires_at")
    table.text("token_type")
    table.text("scope")
    table.text("id_token")
    table.text("session_state")
    /**
     * These are specified here https://next-auth.js.org/adapters/models but
     * only appear necessary for oauth 1. Prisma adapter does not include it
     * so not adding it here.
     *
     * table.text("oauth_token_secret")
     * table.text("oauth_token")
     */
    table.unique(["provider", "providerAccountId"])
  })

  await knex.schema.createTable("NextAuthSession", function (table) {
    table.text("id").notNullable().unique().primary()
    table.text("sessionToken").notNullable().unique()
    table.text("userId").notNullable().references("User.id").onDelete("CASCADE")
    table.timestamp("expires", TIMESTAMP_OPTIONS).notNullable()
  })

  await knex.schema.createTable("NextAuthVerificationToken", function (table) {
    table.text("identifier").notNullable() // email usually
    table.text("token").notNullable().unique()
    table.timestamp("expires", TIMESTAMP_OPTIONS).notNullable() // renamed to `expiresAt`
    table.primary(["identifier", "token"])
  })
}

export async function down(knex: Knex) {
  await knex.schema.dropTable("NextAuthVerificationToken")
  await knex.schema.dropTable("NextAuthSession")
  await knex.schema.dropTable("NextAuthAccount")
  await knex.schema.dropTable("User")
}
