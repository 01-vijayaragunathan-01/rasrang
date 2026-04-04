import fetch from 'node-fetch';

async function test() {
    try {
        console.log("Creating first booking...");
        const res1 = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: "Test User",
                email: "test@example.com",
                events: ["NATYA"]
            })
        });
        const data1 = await res1.json();
        console.log("First booking status:", res1.status, data1.message);

        console.log("\nCreating second booking for same event...");
        const res2 = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: "Test User",
                email: "test@example.com",
                events: ["NATYA"]
            })
        });
        const data2 = await res2.json();
        console.log("Second booking status:", res2.status);
        console.log("Tickets field exists:", !!data2.tickets);
        if (data2.tickets) console.log("Ticket 0 eventName:", data2.tickets[0].eventName);

    } catch(err) {
        console.error(err);
    }
}
test();
