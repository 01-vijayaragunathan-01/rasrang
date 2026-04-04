import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');

    // Clear existing data
    await prisma.registration.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('Creating users...');
    await prisma.user.createMany({
        data: [
            {
                name: 'John Student',
                email: 'john@example.com',
                regNo: 'SRM001',
                password: hashedPassword,
                role: 'STUDENT',
            },
            {
                name: 'Jane Volunteer',
                email: 'jane@example.com',
                regNo: 'SRM002',
                password: hashedPassword,
                role: 'VOLUNTEER',
            },
            {
                name: 'Admin Coordinator',
                email: 'admin@rasrang.com',
                regNo: 'ADMIN1',
                password: hashedPassword,
                role: 'COORDINATOR',
            }
        ]
    });

    console.log('Creating events...');
    await prisma.event.createMany({
        data: [
            {
                title: 'Battle of Bands',
                category: 'Music',
                description: 'The ultimate music showdown.',
                date: 'MARCH 15',
                capacity: 100,
            },
            {
                title: 'Hackathon',
                category: 'Tech',
                description: '24 hour coding marathon.',
                date: 'MARCH 16',
                capacity: 50,
            }
        ]
    });

    console.log('Seeding Complete!');
}

main()
    .catch((e) => {
        console.error('Seeding Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
