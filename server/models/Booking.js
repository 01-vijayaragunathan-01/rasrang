import pool from '../db.js';

export async function createBooking({ id, userName, email, events }) {
    await pool.query(
        `INSERT INTO bookings (id, userName, email, events) VALUES ($1, $2, $3, $4)`,
        [id, userName, email || 'anonymous@rasang.com', JSON.stringify(events)]
    );
    return { id, userName, email, events, createdAt: new Date() };
}

export async function getBookingById(id) {
    const { rows } = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
    if (rows.length === 0) return null;
    const row = rows[0];
    try {
        row.events = typeof row.events === 'string' ? JSON.parse(row.events) : row.events;
    } catch (e) {
        console.error("Error parsing events JSON:", e, "Value:", row.events);
        row.events = [row.events];
    }
    return row;
}

export async function getBookingByEmail(email) {
    const { rows } = await pool.query(`SELECT * FROM bookings WHERE email = $1`, [email]);
    if (rows.length === 0) return null;
    const row = rows[0];
    try {
        row.events = typeof row.events === 'string' ? JSON.parse(row.events) : row.events;
    } catch (e) {
        console.error("Error parsing events JSON:", e, "Value:", row.events);
        row.events = [row.events]; // Fallback if it's just a string in the DB
    }
    return row;
}
