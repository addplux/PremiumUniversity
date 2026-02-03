const axios = require('axios');

async function testApi() {
    try {
        const res = await axios.get('http://localhost:5000/api/organizations/current?tenant=silver-maple');
        console.log('SUCCESS:', res.data.success);
        console.log('Name:', res.data.data.name);
        console.log('Slug:', res.data.data.slug);
        console.log('Hero Image:', res.data.data.branding.heroImage);
    } catch (err) {
        console.error('ERROR:', err.message);
        if (err.response) {
            console.error('Response:', err.response.data);
        }
    }
}

testApi();
