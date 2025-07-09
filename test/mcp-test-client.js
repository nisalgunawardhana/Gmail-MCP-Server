#!/usr/bin/env node

import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import readline from 'readline';

class MCPTestClient {
  constructor() {
    this.nextId = 1;
    this.serverProcess = null;
    this.pendingRequests = new Map();
  }

  async startServer() {
    console.log('Starting MCP server...');
    
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
            console.log('Server output:', message);
          }
        }
      }
    });

    this.serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
    });

    this.serverProcess.on('exit', (code) => {
      console.log(`Server process exited with code: ${code}`);
    });

    // Wait a moment for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
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
      
      // Timeout after 30 seconds
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

  async initialize() {
    console.log('Initializing MCP connection...');
    
    try {
      const initResult = await this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      });
      
      console.log('✅ MCP connection initialized');
      return initResult;
    } catch (error) {
      console.error('❌ Failed to initialize MCP connection:', error.message);
      throw error;
    }
  }

  async listTools() {
    try {
      const result = await this.sendRequest('tools/list');
      console.log('📋 Available tools:');
      result.tools.forEach(tool => {
        console.log(`  - ${tool.name}: ${tool.description}`);
      });
      return result;
    } catch (error) {
      console.error('❌ Failed to list tools:', error.message);
      throw error;
    }
  }

  async sendEmail(emailData) {
    console.log('📧 Sending email...');
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    
    try {
      const result = await this.sendRequest('tools/call', {
        name: 'send_email',
        arguments: emailData
      });
      
      console.log('✅ Email sent successfully!');
      if (result.content && result.content[0]) {
        console.log('Response:', result.content[0].text);
      }
      return result;
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  }

  async getUserInput(prompt) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  async promptForEmail() {
    console.log('\n📝 Enter email details:');
    
    const to = await this.getUserInput('To (email address): ');
    const subject = await this.getUserInput('Subject: ');
    const body = await this.getUserInput('Body: ');
    const cc = await this.getUserInput('CC (optional, comma-separated): ');
    const isHtml = await this.getUserInput('Is HTML content? (y/n): ');

    const emailData = {
      to: to,
      subject: subject,
      body: body,
      html: isHtml.toLowerCase() === 'y' || isHtml.toLowerCase() === 'yes'
    };

    if (cc.trim()) {
      emailData.cc = cc.split(',').map(email => email.trim());
    }

    return emailData;
  }

  async runInteractiveTest() {
    try {
      await this.startServer();
      await this.initialize();
      await this.listTools();

      while (true) {
        console.log('\n🎯 MCP Email Test Options:');
        console.log('1. Send a test email (interactive)');
        console.log('2. Send a quick test email (predefined)');
        console.log('3. List available tools');
        console.log('4. Exit');

        const choice = await this.getUserInput('\nChoose an option (1-4): ');

        switch (choice) {
          case '1':
            const emailData = await this.promptForEmail();
            await this.sendEmail(emailData);
            break;

          case '2':
            const testEmail = await this.getUserInput('Enter your email address for test: ');
            const quickEmail = {
              to: testEmail,
              subject: `MCP Gmail Test - ${new Date().toLocaleString()}`,
              body: 'This is a test email sent through the MCP Gmail server!',
              html: false
            };
            await this.sendEmail(quickEmail);
            break;

          case '3':
            await this.listTools();
            break;

          case '4':
            console.log('👋 Goodbye!');
            this.cleanup();
            return;

          default:
            console.log('❌ Invalid option. Please choose 1-4.');
        }
      }
    } catch (error) {
      console.error('💥 Test failed:', error.message);
      this.cleanup();
      process.exit(1);
    }
  }

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down...');
  process.exit(0);
});

// Start the test client
const client = new MCPTestClient();
client.runInteractiveTest().catch((error) => {
  console.error('Failed to run test:', error);
  process.exit(1);
});
