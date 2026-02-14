
async function main() {
    try {
        console.log("Checking /api/auth/signin...");
        // @ts-ignore
        const res = await fetch("http://localhost:3000/api/auth/signin", {
            redirect: 'manual'
        });
        console.log(`Status: ${res.status}`);
        console.log(`Location: ${res.headers.get('location')}`);

        if (res.status >= 300 && res.status < 400) {
            const loc = res.headers.get('location');
            if (loc) {
                console.log(`Following redirect to ${loc}...`);
                // @ts-ignore
                const res2 = await fetch(loc.startsWith('http') ? loc : `http://localhost:3000${loc}`, {
                    redirect: 'manual'
                });
                console.log(`Status 2: ${res2.status}`);
                console.log(`Location 2: ${res2.headers.get('location')}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
