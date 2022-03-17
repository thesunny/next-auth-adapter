import { Knex } from "knex"
import { TIMESTAMP_OPTIONS } from "../utils"

export async function up(knex: Knex) {
  await knex.schema.createTable("User", function (table) {
    table.text("id").notNullable().unique().primary()
    table.text("name").notNullable()
    table.text("email").notNullable().unique()
    table.timestamp("emailVerified", TIMESTAMP_OPTIONS)
    table.text("image")
    table
      .timestamp("createdAt", TIMESTAMP_OPTIONS)
      .notNullable()
      .defaultTo(knex.fn.now())
    table
      .timestamp("updatedAt", TIMESTAMP_OPTIONS)
      .notNullable()
      .defaultTo(knex.fn.now())
  })

  await knex.schema.createTable("Account", function (table) {
    table.text("id").notNullable().unique().primary()
    table.text("userId").notNullable().references("User.id").onDelete("CASCADE")
    table.text("type").notNullable()
    table.text("provider").notNullable()
    table.text("providerAccountId").notNullable()
    table.text("refreshToken")
    table.text("accessToken")
    table.timestamp("expiresAt", TIMESTAMP_OPTIONS)
    table.text("tokenType")
    table.text("scope")
    table.text("idToken")
    table.text("sessionState")
    table.unique(["provider", "providerAccountId"])
  })

  await knex.schema.createTable("Session", function (table) {
    table.text("id").notNullable().unique().primary()
    table.text("sessionToken").notNullable().unique()
    table.text("userId").notNullable().references("User.id").onDelete("CASCADE")
    table.timestamp("expiresAt", TIMESTAMP_OPTIONS).notNullable()
  })

  await knex.schema.createTable("VerificationToken", function (table) {
    // table.text("id").notNullable().unique().primary() // added and not in Prisma Adapter
    table.text("identifier").notNullable() // email usually
    table.text("token").notNullable().unique()
    table.timestamp("expiresAt", TIMESTAMP_OPTIONS).notNullable() // renamed to `expiresAt`
    table.primary(["identifier", "token"])
  })
}

export async function down(knex: Knex) {
  await knex.schema.dropTable("VerificationToken")
  await knex.schema.dropTable("Session")
  await knex.schema.dropTable("Account")
  await knex.schema.dropTable("User")
}
