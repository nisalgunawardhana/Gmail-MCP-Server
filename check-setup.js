#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkSetup() {
  console.log('🔍 Gmail MCP Server Setup Checker\n');
  
  let hasErrors = false;
  
  // Check 1: credentials.json exists
  console.log('1. Checking credentials.json...');
  try {
    const credentialsPath = path.join(__dirname, 'credentials.json');
    const credentialsContent = await fs.readFile(credentialsPath, 'utf8');
    const credentials = JSON.parse(credentialsContent);
    
    if (credentials.installed || credentials.web) {
      console.log('   ✅ credentials.json found and valid');
      
      // Extract client info
      const clientInfo = credentials.installed || credentials.web;
      console.log(`   📋 Client ID: ${clientInfo.client_id.substring(0, 20)}...`);
      console.log(`   📋 Project ID: ${clientInfo.project_id || 'Not specified'}`);
    } else {
      console.log('   ❌ credentials.json format is invalid');
      hasErrors = true;
    }
  } catch (error) {
    console.log('   ❌ credentials.json not found or invalid');
    console.log('   💡 Download from Google Cloud Console > APIs & Services > Credentials');
    hasErrors = true;
  }
  
  // Check 2: token.json exists
  console.log('\n2. Checking token.json...');
  try {
    const tokenPath = path.join(__dirname, 'token.json');
    const tokenContent = await fs.readFile(tokenPath, 'utf8');
    const token = JSON.parse(tokenContent);
    
    if (token.access_token) {
      console.log('   ✅ token.json found with access token');
      
      // Check expiry
      if (token.expiry_date && token.expiry_date <= Date.now()) {
        console.log('   ⚠️  Token has expired - will auto-refresh');
      } else {
        console.log('   ✅ Token is valid');
      }
    } else {
      console.log('   ❌ token.json exists but missing access_token');
      hasErrors = true;
    }
  } catch (error) {
    console.log('   ❌ token.json not found');
    console.log('   💡 Run "npm run setup" to authenticate');
    hasErrors = true;
  }
  
  // Check 3: Environment file
  console.log('\n3. Checking .env file...');
  try {
    const envPath = path.join(__dirname, '.env');
    await fs.access(envPath);
    console.log('   ✅ .env file found');
  } catch (error) {
    console.log('   ⚠️  .env file not found (optional)');
    console.log('   💡 Copy .env.example to .env if you need custom configuration');
  }
  
  // Check 4: Dependencies
  console.log('\n4. Checking dependencies...');
  try {
    const packagePath = path.join(__dirname, 'package.json');
    const packageContent = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    await fs.access(nodeModulesPath);
    
    console.log('   ✅ Dependencies installed');
    console.log(`   📦 Project: ${packageJson.name} v${packageJson.version}`);
  } catch (error) {
    console.log('   ❌ Dependencies not installed');
    console.log('   💡 Run "npm install"');
    hasErrors = true;
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ Setup incomplete - please fix the issues above');
    console.log('\n📖 For detailed help, see TROUBLESHOOTING.md');
    console.log('🚀 Quick fix: npm install && npm run setup');
  } else {
    console.log('✅ Setup looks good!');
    console.log('\n🚀 You can now start the server with: npm start');
    console.log('📖 See examples/usage-examples.md for usage examples');
  }
  
  // Additional suggestions
  console.log('\n💡 Helpful commands:');
  console.log('   npm run setup    - Complete OAuth authentication');
  console.log('   npm start        - Start the MCP server');
  console.log('   npm test         - Run basic tests');
  console.log('   npm run dev      - Start with auto-reload');
}

checkSetup().catch(error => {
  console.error('Setup checker failed:', error.message);
  process.exit(1);
});
