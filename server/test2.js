import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugMissingEntries() {
try {
console.log("Scanning for students with incomplete core profiles (ignoring Branch & Section)...\n");

// Fetch students where ANY of the core onboarding fields are missing
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
},
select: {
name: true,
email: true,
regNo: true,
clgName: true,
year: true,
dept: true,
phoneNo: true,
isOnboarded: true
}
});

// Map the results to determine exactly WHICH core fields are missing
const formattedResults = incompleteStudents.map(student => {
const missingFields = [];

// Check each core field to see if it's null or an empty string
if (!student.regNo) missingFields.push("regNo");
if (!student.clgName) missingFields.push("clgName");
if (!student.year) missingFields.push("year");
if (!student.dept) missingFields.push("dept");
if (!student.phoneNo) missingFields.push("phoneNo");

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