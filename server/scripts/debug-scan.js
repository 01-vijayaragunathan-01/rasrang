import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugMissingEntries() {
    try {
        console.log("Scanning for students with incomplete core profiles...\n");

        const incompleteStudents = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                OR: [
                    { regNo: null }, { regNo: '' },
                    { clgName: null }, { clgName: '' },
                    { year: null }, { year: '' },
                    { dept: null }, { dept: '' },
                    { phoneNo: null }, { phoneNo: '' }
                ]
            }
        });

        console.log(`=== ALERT: ${incompleteStudents.length} Student(s) Missing Core Data ===\n`);
        
        if (incompleteStudents.length > 0) {
            console.table(incompleteStudents.map(s => ({
                name: s.name,
                email: s.email,
                regNo: s.regNo,
                clgName: s.clgName,
                isOnboarded: s.isOnboarded
            })));
        }

    } catch (error) {
        console.error("Debug script failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

debugMissingEntries();
