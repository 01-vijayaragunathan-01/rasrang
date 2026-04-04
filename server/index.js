import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { createBooking } from './models/Booking.js';
import { createTicket, getTicketsByBookingId } from './models/Ticket.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper: generate a short random ID
function randomId() {
    return Math.random().toString(36).substr(2, 9);
}

// Bootstrap: connect and create tables
async function initDatabase() {
    const { default: pool } = await import('./db.js');

    // Create tables with PostgreSQL syntax
    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id VARCHAR(36) PRIMARY KEY,
            userName VARCHAR(255) NOT NULL,
            email VARCHAR(255) DEFAULT 'anonymous@rasang.com',
            events JSONB NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tickets (
            id VARCHAR(36) PRIMARY KEY,
            bookingId VARCHAR(36) NOT NULL,
            eventName VARCHAR(255) NOT NULL,
            userName VARCHAR(255) NOT NULL,
            ticketId VARCHAR(50) NOT NULL UNIQUE,
            seat VARCHAR(20),
            date VARCHAR(50) DEFAULT 'MARCH 15-16',
            time VARCHAR(50) DEFAULT '10:00 AM',
            venue VARCHAR(255) DEFAULT 'MAIN CAMPUS GROUNDS',
            qrCode TEXT,
            FOREIGN KEY (bookingId) REFERENCES bookings(id)
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS students (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            registerNo VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            mobile VARCHAR(20) NOT NULL,
            password VARCHAR(255),
            institution VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Ensure password column exists if table was already created
    try { await pool.query('ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255)'); } catch (e) {}

    await pool.query(`
        CREATE TABLE IF NOT EXISTS faculty_passes (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            institution VARCHAR(255) NOT NULL,
            department VARCHAR(255) NOT NULL,
            designation VARCHAR(255) NOT NULL,
            employeeId VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            mobile VARCHAR(20) NOT NULL,
            password VARCHAR(255),
            eventsAttending TEXT NOT NULL,
            passCode VARCHAR(50) NOT NULL UNIQUE,
            qrCode TEXT,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Ensure password column exists if table was already created
    try { await pool.query('ALTER TABLE faculty_passes ADD COLUMN IF NOT EXISTS password VARCHAR(255)'); } catch (e) {}

    console.log('PostgreSQL database and tables ready.');
}

// Faculty Pass registration
app.post('/api/faculty-pass', async (req, res) => {
    try {
        const { name, institution, department, designation, employeeId, email, mobile, password, eventsAttending } = req.body;
        if (!name || !institution || !email || !mobile) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const { default: pool } = await import('./db.js');

        // Check for existing faculty pass by email or employeeId
        const { rows: existing } = await pool.query('SELECT * FROM faculty_passes WHERE email = $1 OR employeeId = $2', [email, employeeId]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const id = randomId();
        const passCode = `FAC-26-${Math.floor(10000 + Math.random() * 90000)}`;
        
        // Use mobile as password if not provided explicitly
        const passToHash = password || mobile;
        const hashedPassword = await bcrypt.hash(passToHash, 10);

        // QR payload — encode all key details
        const qrPayload = JSON.stringify({ passCode, name, institution, department, designation, employeeId, email, eventsAttending });
        const qrCode = await QRCode.toDataURL(qrPayload, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2,
            color: { dark: '#1a0a00', light: '#f5e6c8' }
        });

        await pool.query(
            `INSERT INTO faculty_passes (id, name, institution, department, designation, employeeId, email, mobile, password, eventsAttending, passCode, qrCode)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [id, name, institution, department, designation, employeeId, email, mobile, hashedPassword, eventsAttending, passCode, qrCode]
        );

        res.status(201).json({ id, name, institution, department, designation, employeeId, email, mobile, eventsAttending, passCode, qrCode });
    } catch (error) {
        console.error('Faculty pass error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get faculty pass by email
app.get('/api/faculty-pass/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { default: pool } = await import('./db.js');
        const { rows } = await pool.query('SELECT * FROM faculty_passes WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching faculty pass:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Check user registration status
app.get('/api/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { default: pool } = await import('./db.js');

        // Check students
        const { rows: students } = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
        if (students.length > 0) {
            return res.status(200).json({ registered: true, type: 'student', data: students[0] });
        }

        // Check faculty
        const { rows: faculty } = await pool.query('SELECT * FROM faculty_passes WHERE email = $1', [email]);
        if (faculty.length > 0) {
            return res.status(200).json({ registered: true, type: 'faculty', data: faculty[0] });
        }

        return res.status(200).json({ registered: false });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Student registration
app.post('/api/students', async (req, res) => {
    try {
        const { name, registerNo, email, mobile, password, institution } = req.body;
        if (!name || !registerNo || !email || !mobile || !institution) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const { default: pool } = await import('./db.js');

        const { rows: existing } = await pool.query('SELECT * FROM students WHERE email = $1 OR registerNo = $2', [email, registerNo]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const id = randomId();
        const passToHash = password || mobile;
        const hashedPassword = await bcrypt.hash(passToHash, 10);

        await pool.query(
            `INSERT INTO students (id, name, registerNo, email, mobile, password, institution)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [id, name, registerNo, email, mobile, hashedPassword, institution]
        );

        res.status(201).json({ id, name, registerNo, email, mobile, institution });
    } catch (error) {
        console.error('Student registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and password required' });
        }

        const { default: pool } = await import('./db.js');

        // Search students
        const { rows: students } = await pool.query('SELECT * FROM students WHERE registerNo = $1 OR email = $2', [identifier, identifier]);
        if (students.length > 0) {
            const user = students[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return res.status(200).json({ type: 'student', data: user });
            }
        }

        // Search faculty
        const { rows: faculty } = await pool.query('SELECT * FROM faculty_passes WHERE employeeId = $1 OR email = $2', [identifier, identifier]);
        if (faculty.length > 0) {
            const user = faculty[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                return res.status(200).json({ type: 'faculty', data: user });
            }
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { userName, email, events } = req.body;

        if (!userName || !events || events.length === 0) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Restrictions and Checks
        if (email) {
            const { getTicketsByEmail } = await import('./models/Ticket.js');
            const existingTickets = await getTicketsByEmail(email);

            // Double Booking Check: Return existing ticket if already booked
            for (const eventObj of events) {
                const eventName = typeof eventObj === 'string' ? eventObj : (eventObj.title || eventObj.eventName || eventObj.name || 'Tech Event');
                const alreadyRegisteredTicket = existingTickets.find(t => t.eventName === eventName);
                if (alreadyRegisteredTicket) {
                    return res.status(200).json({
                        message: 'Already registered',
                        booking: { id: alreadyRegisteredTicket.bookingId, userName, email, events: [eventName] },
                        tickets: [alreadyRegisteredTicket]
                    });
                }
            }

            // Exclusivity Check: GRAND FINALE PRO SHOW vs Others
            const GRAND_PASS_NAME = "GRAND FINALE PRO SHOW";
            const isBookingGrandPass = events.some(e => {
                const name = typeof e === 'string' ? e : (e.title || e.eventName || e.name);
                return name === GRAND_PASS_NAME;
            });
            const hasExistingGrandPass = existingTickets.some(t => t.eventName === GRAND_PASS_NAME);

            // Max 4 Events Check
            if (!isBookingGrandPass && !hasExistingGrandPass) {
                const totalEventsWillHave = existingTickets.length + events.length;
                if (totalEventsWillHave > 4) {
                    return res.status(403).json({ message: `You can only book a maximum of 4 individual events. You already have ${existingTickets.length} tickets.` });
                }
            }

        }

        const bookingId = randomId();
        const savedBooking = await createBooking({
            id: bookingId,
            userName,
            email: email || 'anonymous@rasang.com',
            events
        });

        // Handle string or object events, ensure eventName string
        const savedTickets = [];
        for (const eventObj of events) {
            const eventName = typeof eventObj === 'string' ? eventObj : (eventObj.title || eventObj.eventName || eventObj.name || 'Tech Event');
            const ticketId = `RSG-26-${Math.floor(1000 + Math.random() * 9000)}`;
            const randomSeat = `${String.fromCharCode(65 + Math.floor(Math.random() * 10))}-${Math.floor(1 + Math.random() * 50)}`;

            // Generate QR code for the ticket
            const qrPayload = JSON.stringify({ ticketId, userName, eventName, bookingId });
            const qrCode = await QRCode.toDataURL(qrPayload, {
                errorCorrectionLevel: 'M',
                width: 200,
                margin: 1,
                color: { dark: '#000000', light: '#ffffff' }
            });

            const ticket = await createTicket({
                id: randomId(),
                bookingId,
                eventName,
                userName,
                ticketId,
                seat: randomSeat,
                date: 'MARCH 15-16',
                time: '10:00 AM',
                venue: 'MAIN CAMPUS GROUNDS',
                qrCode
            });
            savedTickets.push(ticket);
        }

        res.status(201).json({
            message: 'Booking successful',
            booking: savedBooking,
            tickets: savedTickets
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get tickets for a booking
app.get('/api/tickets/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const tickets = await getTicketsByBookingId(bookingId);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get tickets by user email
app.get('/api/tickets/user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { getTicketsByEmail } = await import('./models/Ticket.js');
        const tickets = await getTicketsByEmail(email);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start server after DB is ready
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err.message);
        process.exit(1);
    });
