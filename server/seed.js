import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'rasang',
    port: process.env.PGPORT || 5432,
});

async function seed() {
    try {
        console.log('Seeding Database...');

        // 1. Create Tables (Ensure they exist)
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

        // 2. Clear Existing Data
        await pool.query('DELETE FROM faculty_passes');
        await pool.query('DELETE FROM students');

        // 3. Seed Students
        const students = [
            { id: 's1', name: 'John Doe', registerNo: 'SRM001', email: 'john@example.com', mobile: '9876543210', institution: 'SRM Trichy' },
            { id: 's2', name: 'Jane Smith', registerNo: 'SRM002', email: 'jane@example.com', mobile: '9876543211', institution: 'SRM Trichy' }
        ];

        for (const s of students) {
            const hashedPassword = await bcrypt.hash(s.mobile, 10);
            await pool.query(
                'INSERT INTO students (id, name, registerNo, email, mobile, password, institution) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [s.id, s.name, s.registerNo, s.email, s.mobile, hashedPassword, s.institution]
            );
        }

        // 4. Seed Faculty
        const faculty = [
            { 
                id: 'f1', name: 'Dr. Alan Turing', institution: 'SRM Trichy', department: 'CSE', designation: 'Professor', 
                employeeId: 'EMP001', email: 'turing@example.com', mobile: '9876543212', eventsAttending: 'All Events', passCode: 'FAC-26-12345' 
            }
        ];

        for (const f of faculty) {
            const hashedPassword = await bcrypt.hash(f.mobile, 10);
            await pool.query(
                `INSERT INTO faculty_passes (id, name, institution, department, designation, employeeId, email, mobile, password, eventsAttending, passCode) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [f.id, f.name, f.institution, f.department, f.designation, f.employeeId, f.email, f.mobile, hashedPassword, f.eventsAttending, f.passCode]
            );
        }

        console.log('Seeding Complete!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
