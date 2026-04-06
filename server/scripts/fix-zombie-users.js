import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * REPAIR SCRIPT: Fixes "Zombie" users with missing core data.
 * Assigns temporary regNo (email) and placeholder core data,
 * then forces re-onboarding.
 */
async function repairIncompleteProfiles() {
    try {
        console.log("🛠️ Starting Data Repair Protocol for RasRang 2026...\n");

        // Identify users missing ANY of the now-mandatory fields
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

        for (const user of incompleteUsers) {
            console.log(`⚙️  Repairing: ${user.email} (${user.name})`);

            // 1. Temporary identifier (Unique)
            const tempRegNo = (!user.regNo || user.regNo.trim() === '') ? user.email : user.regNo;
            
            // 2. Temporary phone number (Unique Placeholder)
            // Strategy: 900 + slice of user ID to ensure uniqueness for @unique constraint
            const tempPhone = (!user.phoneNo || user.phoneNo.trim() === '') 
                ? `900${user.id.replace(/-/g, '').substring(0, 7)}` 
                : user.phoneNo;

            // 3. Mandatory placeholders to satisfy schema lock
            const updateData = {
                regNo: tempRegNo,
                phoneNo: tempPhone,
                clgName: user.clgName || "REVO-PENDING-COLLEGE",
                year: user.year || "1",
                dept: user.dept || "REVO-PENDING-DEPT",
                isOnboarded: false // 🛡️ Force them to re-onboard
            };
            
            await prisma.user.update({
                where: { id: user.id },
                data: updateData
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

repairIncompleteProfiles();
