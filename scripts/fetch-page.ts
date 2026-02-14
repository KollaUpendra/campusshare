
async function main() {
    try {
        console.log("Fetching http://localhost:3000/dashboard/profile...");
        const res = await fetch("http://localhost:3000/dashboard/profile");
        console.log(`Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Content Length: ${text.length}`);
        console.log("First 500 chars:", text.substring(0, 500));
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

main();
