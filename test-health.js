// test-health.js
const https = require('https');

// Replace with your actual Cloudflare Pages live URL
const TARGET_URL = 'https://pyflow-curriculum.pages.dev/api/ask'; 

console.log(`Running post-deploy health check against ${TARGET_URL}...`);

// For a simple smoke test, we verify the endpoint is reachable
https.get(TARGET_URL, (res) => {
    console.log(`Response Status Code: ${res.statusCode}`);
    // Even if it returns 405 Method Not Allowed (since GET vs POST), 
    // getting a response proves the serverless worker is alive and routing correctly.
    if (res.statusCode < 500) {
        console.log('✅ Health check passed: Edge worker is responding.');
        process.exit(0);
    } else {
        console.error('❌ Health check failed: Server error detected.');
        process.exit(1);
    }
}).on('error', (err) => {
    console.error('❌ Health check connection error:', err.message);
    process.exit(1);
});