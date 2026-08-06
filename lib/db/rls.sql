-- TSC — Row Level Security policies
-- Run this against your Neon database after running Drizzle migrations.
-- Every table is school_id scoped. Hard constraint — never bypass.
--
-- RLS uses current_setting('app.school_id') set per transaction.
-- The app sets this via db.execute before data queries. See lib/db/with-school.ts.

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mas_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE speed_results ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners
ALTER TABLE schools FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE programs FORCE ROW LEVEL SECURITY;
ALTER TABLE athletes FORCE ROW LEVEL SECURITY;
ALTER TABLE test_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE mas_results FORCE ROW LEVEL SECURITY;
ALTER TABLE speed_results FORCE ROW LEVEL SECURITY;

-- schools: id IS the school_id
CREATE POLICY school_isolation ON schools
  USING (id = current_setting('app.school_id', true)::uuid);

-- All other tables: direct school_id column
CREATE POLICY school_isolation ON users
  USING (school_id = current_setting('app.school_id', true)::uuid);

CREATE POLICY school_isolation ON programs
  USING (school_id = current_setting('app.school_id', true)::uuid);

CREATE POLICY school_isolation ON athletes
  USING (school_id = current_setting('app.school_id', true)::uuid);

CREATE POLICY school_isolation ON test_sessions
  USING (school_id = current_setting('app.school_id', true)::uuid);

CREATE POLICY school_isolation ON mas_results
  USING (school_id = current_setting('app.school_id', true)::uuid);

CREATE POLICY school_isolation ON speed_results
  USING (school_id = current_setting('app.school_id', true)::uuid);
