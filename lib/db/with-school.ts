import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

/**
 * Sets app.school_id for the current database session so Neon RLS policies
 * (defined in rls.sql) can evaluate it via current_setting('app.school_id').
 *
 * With Neon's serverless HTTP driver each server action gets its own
 * connection, so this scopes the setting to exactly one request.
 *
 * Call this immediately after resolving school_id from Clerk, before any
 * data query. The user bootstrap lookup (by clerk_user_id) runs before this
 * call and is safe because clerk_user_id is a unique constraint — there is no
 * cross-school ambiguity when looking up by that key.
 *
 * PRODUCTION NOTE: The DATABASE_URL must use a restricted Postgres role
 * (not neondb_owner) for RLS to be enforced at the DB layer.
 * neondb_owner has BYPASSRLS, so policies are skipped regardless of this call
 * while that role is in use. Create an `app_user` role without BYPASSRLS
 * before launching beyond the single-school pilot.
 */
export async function setSchoolContext(schoolId: string): Promise<void> {
  await db.execute(sql`SELECT set_config('app.school_id', ${schoolId}, false)`)
}
