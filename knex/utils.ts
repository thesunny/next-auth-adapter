import { Knex } from "knex"

/**
 * Timestamp options should be used in the creation of all timestamps.
 *
 * We set `useTz` to `false` because Prisma automatically converts all times
 * to `utc` for us. It appears that by default Knex or the Postgres driversets
 * `useTz` to true). Note that `useTz` does the reverse of what you expect!
 *
 * useTz parameter to timestamp() has a very misleading name #2916
 * https://github.com/knex/knex/issues/2916
 *
 * We set `precision` to `3` because JavaScript has millisecond precision and
 * any more would (a) not add value and (b) may cause issues. Also Prisma uses
 * 3 for their default `DateTime` type.
 */
export const TIMESTAMP_OPTIONS = { useTz: false, precision: 3 }
