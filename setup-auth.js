#!/usr/bin/env node

import { GmailService } from './src/gmail-service.js';
import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function setupAuth() {
  console.log('🔧 Gmail MCP Server Authentication Setup\n');
  
  try {
    const gmailService = new GmailService();
    
    // Check if credentials exist
    const credentialsPath = path.join(__dirname, 'credentials.json');
    try {
      await fs.access(credentialsPath);
      console.log('✅ Found credentials.json');
    } catch {
      console.log('❌ credentials.json not found');
      console.log('\nPlease follow these steps:');
      console.log('1. Go to https://console.cloud.google.com/');
      console.log('2. Create a new project or select existing one');
      console.log('3. Enable the Gmail API');
      console.log('4. Create OAuth 2.0 credentials (Desktop application)');
      console.log('5. Download the JSON file and save as credentials.json in this directory');
      process.exit(1);
    }

    // Load credentials and create auth URL
    const credentials = await gmailService.loadCredentials();
    gmailService.auth = new (await import('googleapis')).google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      'urn:ietf:wg:oauth:2.0:oob' // Always use out-of-band flow for desktop apps
    );

    const authUrl = gmailService.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
    });

    console.log('\n🔗 Authorization URL:');
    console.log(authUrl);
    console.log('\n📋 Please:');
    console.log('1. Visit the URL above');
    console.log('2. Authorize the application');
    console.log('3. Copy the authorization code from the page');
    console.log('\n💡 FINDING THE CODE:');
    console.log('   • Google will show you the authorization code directly on the page');
    console.log('   • Look for text like "Please copy this code, switch to your application and paste it there:"');
    console.log('   • Copy the code shown in the text box or highlighted text');
    console.log('   • The code is usually 50+ characters long and starts with "4/"');
    console.log('\n⚠️  If you get "Error 403: access_denied":');
    console.log('   - Go to Google Cloud Console > OAuth consent screen');
    console.log('   - Add your Gmail address to "Test users" section');
    console.log('   - Then try the authorization URL again');
    
    const code = await question('\n🔑 Enter the authorization code: ');
    
    try {
      const { tokens } = await gmailService.auth.getToken(code);
      gmailService.auth.setCredentials(tokens);
      
      // Save token
      const tokenPath = path.join(__dirname, 'token.json');
      await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
      
      console.log('\n✅ Authentication successful!');
      console.log('📁 Token saved to token.json');
      console.log('\n🚀 You can now run the MCP server with: npm start');
      
    } catch (error) {
      if (error.message.includes('redirect_uri_mismatch')) {
        console.log('\n❌ Authentication failed: Redirect URI Mismatch');
        console.log('\n🔧 To fix this issue:');
        console.log('1. Go to Google Cloud Console');
        console.log('2. Navigate to "APIs & Services" > "Credentials"');
        console.log('3. Click on your OAuth 2.0 Client ID');
        console.log('4. In "Authorized redirect URIs", add these URIs:');
        console.log('   • urn:ietf:wg:oauth:2.0:oob');
        console.log('   • http://localhost');
        console.log('5. Save the changes');
        console.log('6. Download the updated credentials.json file');
        console.log('7. Replace your current credentials.json with the new one');
        console.log('8. Run npm run setup again');
        console.log('\n📖 Full error:', error.message);
      } else if (error.message.includes('access_denied') || error.message.includes('403')) {
        console.log('\n❌ Authentication failed: Access Denied');
        console.log('\n🔧 To fix this issue:');
        console.log('1. Go to Google Cloud Console');
        console.log('2. Navigate to "APIs & Services" > "OAuth consent screen"');
        console.log('3. Scroll down to "Test users" section');
        console.log('4. Click "ADD USERS" and add your Gmail address');
        console.log('5. Save and try running npm run setup again');
        console.log('\n📖 Full error:', error.message);
      } else {
        console.log('\n❌ Authentication failed:', error.message);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupAuth();
