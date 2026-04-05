import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');


    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const pepper = process.env.BCRYPT_SECRET || '';

    console.log('Creating users...');
    await prisma.user.create({
        data: {
            name: 'Platform Super Admin',
            email: 'jafrinsamj@gmail.com',
            password: await bcrypt.hash('platform_2024_secure' + pepper, saltRounds),
            role: 'SUPER_ADMIN',
            regNo: 'PLA001',
            clgName: 'SRM Institute of Science and Technology',
            year: '4th Year',
            dept: 'Computer Science',
            branch: 'Cyber Security',
            section: 'A',
            phoneNo: '9876543210',
            avatarSeed: 'admin-prime-a1',
            isOnboarded: true,
            canManagePrivileges: true
        }
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