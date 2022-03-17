# Next Auth Custom Adapter

Similar to the [Prisma Adapter](https://next-auth.js.org/adapters/prisma) but with these changes:

- Prefixes all tables except `User` with `NextAuth` like `NextAuthSession`
- Ensures an email address is part of the profile and enforces it in the database
- Uses a username derived from the user's email address with a fallback to add numbers as the `User.id`
- Uses nanoid generated alphanumeric characters for all other ids instead of a database generated CUID. The nanoid is shorter and alphanumeric makes it easier to cut and paste the id (slightly smaller id space but still way bigger than we need)
