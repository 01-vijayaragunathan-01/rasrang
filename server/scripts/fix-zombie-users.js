import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * REPAIR SCRIPT: Fixes "Zombie" users with missing core data.
 * Assigns temporary regNo (email) and forces re-onboarding.
 */
async function repairIncompleteProfiles() {
    try {
        console.log("🛠️ Starting Data Repair Protocol for RasRang 2026...\n");

        // 1. Identify users missing CORE FIELDS
        const incompleteUsers = await prisma.user.findMany({
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

        console.log(`📡 Identity Scan: Found ${incompleteUsers.length} users with incomplete profiles.\n`);

        if (incompleteUsers.length === 0) {
            console.log("✅ All systems clear: No incomplete profiles found.");
            return;
        }

        let fixCount = 0;

        // 2. Perform Batch Repairs
        for (const user of incompleteUsers) {
            console.log(`⚙️  Repairing: ${user.email} (${user.name})`);

            // Use email as temporary regNo if missing or empty
            const tempRegNo = (!user.regNo || user.regNo.trim() === '') ? user.email : user.regNo;
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    regNo: tempRegNo,
                    isOnboarded: false // 🛡️ Force them to re-onboard to provide correct data
                }
            });
            fixCount++;
        }

        console.log(`\n🎉 Data Repair Complete: ${fixCount} identities restored.`);
        console.log("==========================================================");

    } catch (error) {
        console.error("❌ Repair script FAILED:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Execute the repair
repairIncompleteProfiles();
