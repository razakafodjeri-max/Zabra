import { createRequire } from 'node:module'
import path from 'node:path'
import { app } from 'electron'

const require = createRequire(import.meta.url)
let db: any

function getDb() {
    if (!db) {
        const Database = require('better-sqlite3')
        const dbPath = path.join(app.getPath('userData'), 'studyflow.db')
        db = new Database(dbPath)
    }
    return db
}

export function initDatabase() {
    const database = getDb()

    // 1. Create tables if they don't exist
    database.exec(`
    CREATE TABLE IF NOT EXISTS profiles(
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS settings(
        profile_id TEXT PRIMARY KEY,
        theme TEXT DEFAULT 'indigo',
        ai_enabled INTEGER DEFAULT 1,
        notifications_enabled INTEGER DEFAULT 1,
        pomodoro_duration INTEGER DEFAULT 25,
        FOREIGN KEY(profile_id) REFERENCES profiles(id)
    );
    `)

    // 2. Robust migration: Check for profile_id in sessions and tasks
    const migrateTable = (tableName: string) => {
        const columns = database.prepare(`PRAGMA table_info(${tableName})`).all()
        const hasProfileId = columns.some((c: any) => c.name === 'profile_id')
        if (!hasProfileId) {
            console.log(`Migrating table ${tableName}: Adding profile_id column`)
            try {
                database.exec(`ALTER TABLE ${tableName} ADD COLUMN profile_id TEXT;`)
            } catch (e) {
                console.error(`Migration failed for ${tableName}:`, e)
            }
        }
    }

    // Ensure sessions and tasks exist before migrating if they were supposed to be created
    database.exec(`
    CREATE TABLE IF NOT EXISTS sessions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time TEXT,
        duration INTEGER,
        focus_score INTEGER,
        type TEXT
    );
    CREATE TABLE IF NOT EXISTS tasks(
        id TEXT PRIMARY KEY,
        title TEXT,
        completed INTEGER,
        pomodoros INTEGER
    );
    `)

    migrateTable('sessions')
    migrateTable('tasks')

    // 3. Finalize structure and defaults
    try {
        database.exec(`
        --Ensure at least one default profile exists
        INSERT OR IGNORE INTO profiles(id, name, created_at) VALUES('default', 'Utilisateur', datetime('now'));
        INSERT OR IGNORE INTO settings(profile_id) VALUES('default');
        `)
        console.log('Database initialized successfully')
    } catch (e) {
        console.error('Database defaults insertion failed:', e)
    }
}

export const dbService = {
    // Profile & Settings
    getProfiles: () => getDb().prepare('SELECT * FROM profiles').all(),
    createProfile: (profile: any) => {
        const db = getDb()
        db.prepare('INSERT INTO profiles (id, name, created_at) VALUES (?, ?, ?)').run(profile.id, profile.name, new Date().toISOString())
        db.prepare('INSERT INTO settings (profile_id) VALUES (?)').run(profile.id)
    },
    deleteProfile: (id: string) => {
        const db = getDb()
        db.prepare('DELETE FROM tasks WHERE profile_id = ?').run(id)
        db.prepare('DELETE FROM sessions WHERE profile_id = ?').run(id)
        db.prepare('DELETE FROM settings WHERE profile_id = ?').run(id)
        db.prepare('DELETE FROM profiles WHERE id = ?').run(id)
    },
    getSettings: (profileId: string) => getDb().prepare('SELECT * FROM settings WHERE profile_id = ?').get(profileId),
    updateSettings: (settings: any) => {
        const db = getDb()
        const stmt = db.prepare('UPDATE settings SET theme = ?, ai_enabled = ?, notifications_enabled = ?, pomodoro_duration = ? WHERE profile_id = ?')
        return stmt.run(settings.theme, settings.ai_enabled ? 1 : 0, settings.notifications_enabled ? 1 : 0, settings.pomodoro_duration, settings.profile_id)
    },

    // Sessions
    saveSession: (session: any) => {
        const database = getDb()
        const stmt = database.prepare('INSERT INTO sessions (profile_id, start_time, duration, focus_score, type) VALUES (?, ?, ?, ?, ?)')
        return stmt.run(session.profile_id, session.start_time, session.duration, session.focus_score, session.type)
    },
    getSessions: (profileId: string) => {
        const database = getDb()
        return database.prepare('SELECT * FROM sessions WHERE profile_id = ? ORDER BY start_time DESC').all(profileId)
    },

    // Tasks
    saveTask: (task: any) => {
        const database = getDb()
        const stmt = database.prepare('INSERT OR REPLACE INTO tasks (id, profile_id, title, completed, pomodoros) VALUES (?, ?, ?, ?, ?)')
        return stmt.run(task.id, task.profile_id, task.title, task.completed ? 1 : 0, task.pomodoros)
    },
    getTasks: (profileId: string) => {
        const database = getDb()
        return database.prepare('SELECT * FROM tasks WHERE profile_id = ?').all(profileId)
    },
    deleteTask: (id: string) => {
        const database = getDb()
        return database.prepare('DELETE FROM tasks WHERE id = ?').run(id)
    }
}
