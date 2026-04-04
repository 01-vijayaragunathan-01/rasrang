import pool from '../db.js';

export async function createTicket({ id, bookingId, eventName, userName, ticketId, seat, date, time, venue, qrCode }) {
    await pool.query(
        `INSERT INTO tickets (id, bookingId, eventName, userName, ticketId, seat, date, time, venue, qrCode)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
            id,
            bookingId,
            eventName,
            userName,
            ticketId,
            seat || null,
            date || 'MARCH 15-16',
            time || '10:00 AM',
            venue || 'MAIN CAMPUS GROUNDS',
            qrCode || null
        ]
    );
    return { id, bookingId, eventName, userName, ticketId, seat, date, time, venue, qrCode };
}

export async function getTicketsByBookingId(bookingId) {
    const { rows } = await pool.query(`SELECT * FROM tickets WHERE bookingId = $1`, [bookingId]);
    return rows;
}

export async function getTicketsByEmail(email) {
    const { rows } = await pool.query(
        `SELECT t.* FROM tickets t 
         JOIN bookings b ON t.bookingId = b.id 
         WHERE b.email = $1`,
        [email]
    );
    return rows;
}

