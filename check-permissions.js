#!/usr/bin/env node

/**
 * Check current Gmail MCP Server permissions and status
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkPermissions() {
  console.log('🔍 Gmail MCP Server Permission Checker\n');
  
  try {
    // Check credentials.json
    const credentialsPath = path.join(__dirname, 'credentials.json');
    try {
      await fs.access(credentialsPath);
      console.log('✅ credentials.json found');
    } catch {
      console.log('❌ credentials.json NOT found');
      console.log('   Run: npm run setup');
      return;
    }

    // Check token.json
    const tokenPath = path.join(__dirname, 'token.json');
    try {
      const tokenContent = await fs.readFile(tokenPath, 'utf8');
      const token = JSON.parse(tokenContent);
      
      console.log('✅ token.json found');
      
      // Check scopes
      const currentScopes = token.scope ? token.scope.split(' ') : [];
      console.log('\n📋 Current permissions:');
      
      const scopeDescriptions = {
        'https://www.googleapis.com/auth/gmail.send': '📤 Send emails',
        'https://www.googleapis.com/auth/gmail.readonly': '📥 Read emails and metadata', 
        'https://www.googleapis.com/auth/gmail.modify': '✏️  Modify email labels and properties'
      };
      
      currentScopes.forEach(scope => {
        const description = scopeDescriptions[scope] || `❓ ${scope}`;
        console.log(`   • ${description}`);
      });
      
      // Check if we have all required scopes
      const requiredScopes = [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ];
      
      const missingScopes = requiredScopes.filter(scope => !currentScopes.includes(scope));
      
      if (missingScopes.length === 0) {
        console.log('\n🎉 All permissions are correctly configured!');
        console.log('\n🚀 Available features:');
        console.log('   • send_email - Send emails');
        console.log('   • get_inbox_emails - Get inbox emails');
        console.log('   • get_email_by_id - Get specific email details');
        console.log('   • search_emails - Search emails with queries');
        console.log('   • get_sent_emails - Get sent emails');
        console.log('   • get_draft_emails - Get draft emails');
        console.log('\n✅ You can test with: npm run test:operations');
      } else {
        console.log('\n⚠️  Missing permissions:');
        missingScopes.forEach(scope => {
          const description = scopeDescriptions[scope] || scope;
          console.log(`   • ${description}`);
        });
        
        console.log('\n🔧 To fix this:');
        console.log('   1. Delete current token: rm token.json');
        console.log('   2. Re-authenticate: npm run setup');
        console.log('   OR');
        console.log('   3. Use re-auth script: npm run reauth');
      }
      
      // Check token expiry
      if (token.expiry_date) {
        const expiryDate = new Date(token.expiry_date);
        const now = new Date();
        
        if (expiryDate < now) {
          console.log('\n⚠️  Token has expired');
          console.log('   The server will automatically refresh it when needed');
        } else {
          const hoursUntilExpiry = Math.round((expiryDate - now) / (1000 * 60 * 60));
          console.log(`\n⏰ Token expires in ${hoursUntilExpiry} hours`);
        }
      }
      
    } catch (error) {
      console.log('❌ token.json NOT found or invalid');
      console.log('   Run: npm run setup');
    }
    
  } catch (error) {
    console.error('❌ Permission check failed:', error.message);
  }
}

checkPermissions();