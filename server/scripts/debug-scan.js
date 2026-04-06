import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugMissingEntries() {
    try {
        console.log("Scanning for students with incomplete core profiles (ignoring Branch & Section)...\n");

        // 1. Use Raw SQL to bypass Prisma's strict schema validation
        // This directly asks Postgres for the bad rows, allowing us to safely check for NULLs
        const incompleteStudents = await prisma.$queryRaw`
            SELECT name, email, "regNo", "clgName", year, dept, "phoneNo", "isOnboarded"
            FROM "User"
            WHERE role = 'STUDENT'
              AND (
                  "regNo" IS NULL OR "regNo" = ''
               OR "clgName" IS NULL OR "clgName" = ''
               OR year IS NULL OR year = ''
               OR dept IS NULL OR dept = ''
               OR "phoneNo" IS NULL OR "phoneNo" = ''
              )
        `;

        // 2. Map the results to determine exactly WHICH core fields are missing
        const formattedResults = incompleteStudents.map(student => {
            const missingFields = [];

            // Check each core field to see if it's null or an empty string
            if (!student.regNo || student.regNo.trim() === '') missingFields.push("regNo");
            if (!student.clgName || student.clgName.trim() === '') missingFields.push("clgName");
            if (!student.year || student.year.trim() === '') missingFields.push("year");
            if (!student.dept || student.dept.trim() === '') missingFields.push("dept");
            if (!student.phoneNo || student.phoneNo.trim() === '') missingFields.push("phoneNo");

            return {
                Name: student.name,
                Email: student.email,
                College: student.clgName || "[MISSING]",
                "Onboarded?": student.isOnboarded ? "Yes" : "No",
                "Missing Core Fields": missingFields.join(", ")
            };
        });

        console.log(`=== ALERT: ${formattedResults.length} Student(s) Have Missing Core Data ===\n`);

        if (formattedResults.length === 0) {
            console.log("Awesome! All student profiles have the required core fields.");
        } else {
            // Print the array of objects as a table
            console.table(formattedResults);
        }

        console.log("\n==========================================================");

    } catch (error) {
        console.error("Debug script failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function
debugMissingEntries();