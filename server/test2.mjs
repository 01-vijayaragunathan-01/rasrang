
async function test() {
    const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userName: "Test User",
            email: "test2@example.com",
            events: ["NATYA"]
        })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
