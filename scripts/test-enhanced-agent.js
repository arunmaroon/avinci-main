const enhancedAgentBuilder = require('./services/enhancedAgentBuilder');

async function testEnhancedAgent() {
    try {
        console.log('Testing enhanced agent creation...');
        
        const transcript = "Hi, I am Sarah and I work in fintech. I love using mobile apps for banking but sometimes I get confused by all the technical terms. I prefer simple explanations and step-by-step guidance. When I am unsure about something, I usually ask my colleagues for help.";
        
        const demographics = {
            name: "Sarah Chen",
            age: 28,
            gender: "female",
            occupation: "Fintech Professional",
            location: "San Francisco"
        };
        
        const agent = await enhancedAgentBuilder.createAgentFromTranscript(
            transcript, 
            demographics, 
            'test-user'
        );
        
        console.log('Agent created successfully:', agent);
    } catch (error) {
        console.error('Enhanced agent test failed:', error.message);
    }
}

testEnhancedAgent();
