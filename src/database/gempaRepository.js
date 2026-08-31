const db = require('./database');

function getEarthquakeId(gempa) {
    return `${gempa.Tanggal}-${gempa.Jam}-${gempa.Magnitude}-${gempa.Wilayah}`;
}

function saveEarthquake(gempa) {
    const id = getEarthquakeId(gempa);

    const statement = db.prepare(`
        INSERT OR IGNORE INTO earthquakes (
            id,
            tanggal,
            jam,
            datetime,
            magnitude,
            kedalaman,
            wilayah,
            potensi,
            dirasakan,
            lintang,
            bujur,
            shakemap
        ) VALUES (
            @id,
            @tanggal,
            @jam,
            @datetime,
            @magnitude,
            @kedalaman,
            @wilayah,
            @potensi,
            @dirasakan,
            @lintang,
            @bujur,
            @shakemap
        )
    `);

    const result = statement.run({
        id,
        tanggal: gempa.Tanggal,
        jam: gempa.Jam,
        datetime: `${gempa.Tanggal} ${gempa.Jam}`,
        magnitude: Number(gempa.Magnitude),
        kedalaman: gempa.Kedalaman,
        wilayah: gempa.Wilayah,
        potensi: gempa.Potensi,
        dirasakan: gempa.Dirasakan,
        lintang: gempa.Lintang,
        bujur: gempa.Bujur,
        shakemap: gempa.Shakemap
    });

    return {
        id,
        isNew: result.changes > 0
    };
}

function getLatestEarthquakes(limit = 10) {
    return db.prepare(`
        SELECT *
        FROM earthquakes
        ORDER BY created_at DESC
        LIMIT ?
    `).all(limit);
}

function getEarthquakeById(id) {
    return db.prepare(`
        SELECT *
        FROM earthquakes
        WHERE id = ?
    `).get(id);
}

module.exports = {
    getEarthquakeId,
    saveEarthquake,
    getLatestEarthquakes,
    getEarthquakeById
};