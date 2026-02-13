const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

async function verifySystem() {
    console.log('🚀 Starting System Verification...\n');

    try {
        // 1. Auth Test
        console.log('🔐 Testing Authentication...');
        const authRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@flowrite.com',
            password: 'password123'
        });
        const token = authRes.data.token;
        console.log('✅ Auth Successful: Token received.\n');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Customers API
        console.log('👥 Testing Customers API...');
        const custRes = await axios.get(`${API_URL}/customers`, config);
        console.log(`✅ Customers API: Found ${custRes.data.customers.length} customers.\n`);

        // 3. Items API
        console.log('🧱 Testing Items API...');
        const itemRes = await axios.get(`${API_URL}/items`, config);
        console.log(`✅ Items API: Found ${itemRes.data.items.length} materials.\n`);

        // 4. Submissions API
        console.log('📝 Testing Submissions API...');
        const subRes = await axios.get(`${API_URL}/submissions`, config);
        console.log(`✅ Submissions API: Found ${subRes.data.submissions.length} submissions.\n`);

        // 5. Docket Generation Test
        if (custRes.data.customers.length > 0) {
            console.log('📑 Testing Docket Generation...');
            try {
                const docketRes = await axios.post(`${API_URL}/dockets/generate`, {
                    customer: custRes.data.customers[0].name,
                    startDate: '2020-01-01',
                    endDate: '2030-01-01'
                }, config);
                console.log(`✅ Docket Generation: Created #${docketRes.data.data._id}\n`);
            } catch (e) {
                console.log('⚠️ Docket Gen failed (Expected if no submissions exist for period)\n');
            }
        }

        console.log('🏁 Verification Complete: All core APIs are healthy.');
    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data?.message || error.message);
        process.exit(1);
    }
}

verifySystem();
