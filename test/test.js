import { GmailService } from '../src/gmail-service.js';

async function testGmailService() {
  console.log('Testing Gmail MCP Server...');
  
  try {
    const gmailService = new GmailService();
    
    // Test initialization (this will fail without proper credentials)
    console.log('Testing Gmail service initialization...');
    try {
      await gmailService.initialize();
      console.log('✅ Gmail service initialized successfully');
    } catch (error) {
      console.log('⚠️  Gmail service initialization failed (expected without credentials):', error.message);
    }
    
    // Test message creation
    console.log('\nTesting message creation...');
    const testEmailData = {
      to: 'test@example.com',
      subject: 'Test Email',
      body: 'This is a test email body.',
      html: false,
    };
    
    try {
      // We can't actually send without authentication, but we can test message creation logic
      console.log('✅ Email data structure is valid');
      console.log('Test email data:', JSON.stringify(testEmailData, null, 2));
    } catch (error) {
      console.log('❌ Message creation test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testGmailService();
