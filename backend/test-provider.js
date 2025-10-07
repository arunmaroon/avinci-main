const providerGateway = require('./services/providerGateway');

async function testProvider() {
    try {
        console.log('Testing provider gateway...');
        const provider = providerGateway.getProvider();
        console.log('Provider:', provider ? 'Available' : 'Not available');
        
        if (provider) {
            const response = await provider.chat([
                { role: 'user', content: 'Hello, how are you?' }
            ], { temperature: 0.7, max_tokens: 50 });
            console.log('Response:', response);
        }
    } catch (error) {
        console.error('Provider test failed:', error.message);
    }
}

testProvider();
