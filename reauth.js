#!/usr/bin/env node

/**
 * Re-authentication script for Gmail MCP Server
 * Use this when you need to upgrade permissions from send-only to full email access
 */

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

async function reauth() {
  console.log('🔄 Gmail MCP Server Re-Authentication\n');
  console.log('This will upgrade your permissions to access inbox and email reading features.\n');
  
  try {
    // Check current token scopes
    const tokenPath = path.join(__dirname, 'token.json');
    let currentScopes = [];
    
    try {
      const tokenContent = await fs.readFile(tokenPath, 'utf8');
      const token = JSON.parse(tokenContent);
      currentScopes = token.scope ? token.scope.split(' ') : [];
      
      console.log('📋 Current permissions:');
      currentScopes.forEach(scope => {
        console.log(`   • ${scope.replace('https://www.googleapis.com/auth/gmail.', 'gmail.')}`);
      });
      console.log('');
      
      // Check if we already have all required scopes
      const requiredScopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly', 
        'https://www.googleapis.com/auth/gmail.modify'
      ];
      
      const hasAllScopes = requiredScopes.every(scope => currentScopes.includes(scope));
      
      if (hasAllScopes) {
        console.log('✅ You already have all required permissions!');
        console.log('The "Insufficient Permission" error might be due to a different issue.');
        console.log('\n💡 Try these troubleshooting steps:');
        console.log('1. Wait a few minutes for permissions to propagate');
        console.log('2. Check if your Gmail API is enabled in Google Cloud Console');
        console.log('3. Verify your OAuth consent screen is properly configured');
        process.exit(0);
      }
      
    } catch (error) {
      console.log('ℹ️  No existing token found or unable to read current permissions.');
    }

    const gmailService = new GmailService();
    
    // Check if credentials exist
    const credentialsPath = path.join(__dirname, 'credentials.json');
    try {
      await fs.access(credentialsPath);
      console.log('✅ Found credentials.json');
    } catch {
      console.log('❌ credentials.json not found');
      console.log('\nPlease ensure credentials.json exists in the project directory.');
      process.exit(1);
    }

    // Load credentials and create auth URL
    const credentials = await gmailService.loadCredentials();
    gmailService.auth = new (await import('googleapis')).google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      'urn:ietf:wg:oauth:2.0:oob'
    );

    const authUrl = gmailService.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      prompt: 'consent' // Force consent screen to show all permissions
    });

    console.log('🆕 New permissions that will be requested:');
    console.log('   • gmail.send (Send emails)');
    console.log('   • gmail.readonly (Read emails and metadata)');
    console.log('   • gmail.modify (Modify email labels and properties)');
    console.log('');

    console.log('🔗 Authorization URL:');
    console.log(authUrl);
    console.log('\n📋 Please:');
    console.log('1. Visit the URL above');
    console.log('2. Grant ALL requested permissions');
    console.log('3. Copy the authorization code from the page');
    console.log('\n💡 IMPORTANT:');
    console.log('   • Make sure to ALLOW all permission requests');
    console.log('   • The permissions screen will show access to "Read, compose, send, and permanently delete all your email from Gmail"');
    console.log('   • This is normal and required for the email reading features');
    
    const code = await question('\n🔑 Enter the authorization code: ');
    
    try {
      const { tokens } = await gmailService.auth.getToken(code);
      gmailService.auth.setCredentials(tokens);
      
      // Delete old token first
      try {
        await fs.unlink(tokenPath);
        console.log('🗑️  Removed old token');
      } catch (error) {
        // Token didn't exist, that's fine
      }
      
      // Save new token
      await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
      
      console.log('\n✅ Re-authentication successful!');
      console.log('📁 New token saved to token.json');
      console.log('\n🎉 You now have access to all email features:');
      console.log('   • Send emails');
      console.log('   • Read inbox');
      console.log('   • Search emails');
      console.log('   • Access sent emails');
      console.log('   • View drafts');
      console.log('\n🚀 You can now test the features with: npm run test:operations');
      
    } catch (error) {
      if (error.message.includes('access_denied') || error.message.includes('403')) {
        console.log('\n❌ Authentication failed: Access Denied');
        console.log('\n🔧 To fix this issue:');
        console.log('1. Go to Google Cloud Console');
        console.log('2. Navigate to "APIs & Services" > "OAuth consent screen"');
        console.log('3. Scroll down to "Test users" section');
        console.log('4. Click "ADD USERS" and add your Gmail address');
        console.log('5. Save and try running this script again');
        console.log('\n📖 Full error:', error.message);
      } else {
        console.log('\n❌ Re-authentication failed:', error.message);
      }
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Re-authentication failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

reauth();