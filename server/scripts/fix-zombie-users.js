import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function repair() {
    console.log("🛠️ Starting Ultimate Data Repair Protocol...\n");

    try {
        // 🔢 1. TOTAL USERS
        const totalUsers = await prisma.user.count({
            where: { role: 'STUDENT' }
        });

        console.log(`👥 Total STUDENT users: ${totalUsers}`);

        // 🔍 2. FIND INCOMPLETE USERS (NULL + "")
        const incompleteUsers = await prisma.$queryRaw`
            SELECT id, email, name, "regNo", "phoneNo", "clgName", year, dept 
            FROM "User" 
            WHERE role = 'STUDENT'
              AND (
                  "regNo" IS NULL OR "regNo" = ''
               OR "phoneNo" IS NULL OR "phoneNo" = ''
               OR "clgName" IS NULL OR "clgName" = ''
               OR year IS NULL OR year = ''
               OR dept IS NULL OR dept = ''
              )
        `;

        const totalIncomplete = incompleteUsers.length;

        console.log(`⚠️ Incomplete users found: ${totalIncomplete}\n`);

        if (totalIncomplete === 0) {
            console.log("✅ All systems clear: No incomplete profiles found.");
            return;
        }

        console.log("🚀 Starting patch process...\n");

        let repairedCount = 0;

        for (const user of incompleteUsers) {
            // 🔐 Safe fallback values
            const safeRegNo = (!user.regNo || user.regNo.trim() === '') 
                ? user.email 
                : user.regNo;

            const safePhone = (!user.phoneNo || user.phoneNo.trim() === '') 
                ? `900${user.id.replace(/-/g, '').substring(0, 7)}` 
                : user.phoneNo;

            const safeClg = (!user.clgName || user.clgName.trim() === '') 
                ? "PENDING-COLLEGE" 
                : user.clgName;

            const safeYear = (!user.year || user.year.trim() === '') 
                ? "1" 
                : user.year;

            const safeDept = (!user.dept || user.dept.trim() === '') 
                ? "PENDING-DEPT" 
                : user.dept;

            // 🛠️ Update
            await prisma.$executeRaw`
                UPDATE "User"
                SET 
                    "regNo" = ${safeRegNo},
                    "phoneNo" = ${safePhone},
                    "clgName" = ${safeClg},
                    "year" = ${safeYear},
                    "dept" = ${safeDept},
                    "isOnboarded" = false
                WHERE id = ${user.id}
            `;

            repairedCount++;

            // 📊 Progress log
            console.log(`✔️ [${repairedCount}/${totalIncomplete}] ${user.email}`);
        }

        // 📊 FINAL SUMMARY
        console.log("\n=======================================");
        console.log("🎉 REPAIR SUMMARY");
        console.log("=======================================");
        console.log(`👥 Total Users        : ${totalUsers}`);
        console.log(`⚠️ Incomplete Found  : ${totalIncomplete}`);
        console.log(`🛠️ Repaired Users    : ${repairedCount}`);
        console.log(`✅ Remaining Clean   : ${totalUsers - repairedCount}`);
        console.log("=======================================\n");

    } catch (error) {
        console.error("❌ Repair failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

repair();