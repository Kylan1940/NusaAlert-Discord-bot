const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataFolder = path.join(__dirname, '../../data');

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

const dbPath = path.join(dataFolder, 'nusaalert.db');

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS earthquakes (
        id TEXT PRIMARY KEY,
        tanggal TEXT NOT NULL,
        jam TEXT NOT NULL,
        datetime TEXT,
        magnitude REAL,
        kedalaman TEXT,
        wilayah TEXT,
        potensi TEXT,
        dirasakan TEXT,
        lintang TEXT,
        bujur TEXT,
        shakemap TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;