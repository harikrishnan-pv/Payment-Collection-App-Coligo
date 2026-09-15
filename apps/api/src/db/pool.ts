import pg from "pg";
import { config } from "../config";

// DATE columns come back as raw 'YYYY-MM-DD' strings instead of Date objects
// (avoids timezone off-by-one when formatting issue dates).
pg.types.setTypeParser(pg.types.builtins.DATE, (v: string) => v);

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export type QueryResultRow = pg.QueryResultRow;
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params as never[]);
}
