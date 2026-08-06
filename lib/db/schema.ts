import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  real,
  boolean,
  date,
} from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['ga', 'director', 'admin'])
export const seasonPhaseEnum = pgEnum('season_phase', [
  'offseason',
  'preseason',
  'in_season',
  'postseason',
])
export const conditioningGoalEnum = pgEnum('conditioning_goal', [
  'build',
  'maintain',
  'peak',
])
export const printPaperSizeEnum = pgEnum('print_paper_size', [
  'letter_8_5x11',
  'a4',
])
export const sexEnum = pgEnum('sex', ['male', 'female'])
export const testTypeEnum = pgEnum('test_type', ['20M_MST', 'speed'])

export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  division: text('division'),
  state: text('state'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id),
  email: text('email').notNull(),
  role: roleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const programs = pgTable('programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id),
  sport: text('sport').notNull(),
  name: text('name').notNull(),
  seasonPhase: seasonPhaseEnum('season_phase').notNull(),
  conditioningGoal: conditioningGoalEnum('conditioning_goal').notNull(),
  printPaperSize: printPaperSizeEnum('print_paper_size')
    .notNull()
    .default('letter_8_5x11'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const athletes = pgTable('athletes', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id')
    .notNull()
    .references(() => programs.id),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id),
  name: text('name').notNull(),
  position: text('position'),
  sex: sexEnum('sex').notNull(),
  birthDate: date('birth_date'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const testSessions = pgTable('test_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id')
    .notNull()
    .references(() => programs.id),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  date: date('date').notNull(),
  testType: testTypeEnum('test_type').notNull(),
  conditions: text('conditions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const masResults = pgTable('mas_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => testSessions.id),
  athleteId: uuid('athlete_id')
    .notNull()
    .references(() => athletes.id),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id),
  level: integer('level').notNull(),
  shuttleInLevel: integer('shuttle_in_level').notNull(),
  totalShuttleCount: integer('total_shuttle_count').notNull(),
  vvo2maxKmh: real('vvo2max_kmh').notNull(),
  masMs: real('mas_ms').notNull(),
  estimatedVo2max: real('estimated_vo2max').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const speedResults = pgTable('speed_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => testSessions.id),
  athleteId: uuid('athlete_id')
    .notNull()
    .references(() => athletes.id),
  schoolId: uuid('school_id')
    .notNull()
    .references(() => schools.id),
  flyDistanceM: real('fly_distance_m').notNull().default(10.0),
  flyTimeS: real('fly_time_s').notNull(),
  mssMs: real('mss_ms').notNull(),
  asrMs: real('asr_ms').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
