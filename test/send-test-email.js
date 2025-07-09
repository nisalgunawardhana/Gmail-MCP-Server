#!/usr/bin/env node

import { spawn } from 'child_process';

/**
 * Simple MCP client to send a test email
 * Usage: node test/send-test-email.js your-email@example.com "Test Subject" "Test Body"
 */

class QuickMCPClient {
  constructor() {
    this.nextId = 1;
    this.serverProcess = null;
    this.pendingRequests = new Map();
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['src/index.js'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        cwd: process.cwd()
      });

      this.serverProcess.stdout.on('data', (data) => {
        const messages = data.toString().split('\n').filter(line => line.trim());
        
        for (const message of messages) {
          if (message.trim()) {
            try {
              const response = JSON.parse(message);
              this.handleResponse(response);
            } catch (error) {
              // Ignore non-JSON output
            }
          }
        }
      });

      this.serverProcess.on('error', reject);
      
      // Wait for server to initialize
      setTimeout(resolve, 2000);
    });
  }

  sendRequest(method, params = {}) {
    const id = this.nextId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      const requestJson = JSON.stringify(request) + '\n';
      this.serverProcess.stdin.write(requestJson);
      
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  handleResponse(response) {
    if (response.id && this.pendingRequests.has(response.id)) {
      const { resolve, reject } = this.pendingRequests.get(response.id);
      this.pendingRequests.delete(response.id);
      
      if (response.error) {
        reject(new Error(response.error.message || 'Unknown error'));
      } else {
        resolve(response.result);
      }
    }
  }

  async sendTestEmail(to, subject, body, isHtml = false) {
    try {
      console.log('🚀 Starting MCP server...');
      await this.startServer();

      console.log('🔌 Initializing connection...');
      await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: { name: 'quick-test-client', version: '1.0.0' }
      });

      console.log('📧 Sending email...');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Body: ${body.substring(0, 50)}${body.length > 50 ? '...' : ''}`);

      const result = await this.sendRequest('tools/call', {
        name: 'send_email',
        arguments: { to, subject, body, html: isHtml }
      });

      console.log('✅ Email sent successfully!');
      if (result.content && result.content[0]) {
        console.log('📋 Response:', result.content[0].text);
      }

      this.cleanup();
      return true;

    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      this.cleanup();
      return false;
    }
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('Usage: node test/send-test-email.js <to-email> <subject> <body> [html]');
  console.log('');
  console.log('Examples:');
  console.log('  node test/send-test-email.js "user@example.com" "Test Email" "Hello from MCP!"');
  console.log('  node test/send-test-email.js "user@example.com" "HTML Test" "<h1>Hello</h1>" true');
  process.exit(1);
}

const [to, subject, body, html] = args;
const isHtml = html === 'true' || html === '1';

// Create and run the test
const client = new QuickMCPClient();

client.sendTestEmail(to, subject, body, isHtml)
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });

// Handle cleanup on exit
process.on('SIGINT', () => {
  client.cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  client.cleanup();
  process.exit(0);
});
