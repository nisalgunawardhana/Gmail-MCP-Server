#!/usr/bin/env node

/**
 * Test script for email operations
 * This script demonstrates how to use the Gmail MCP Server tools
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPClient {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
  }

  async start() {
    const serverPath = path.join(__dirname, '..', 'src', 'index.js');
    this.serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      const onData = (data) => {
        try {
          const response = JSON.parse(data.toString());
          this.serverProcess.stdout.off('data', onData);
          resolve(response);
        } catch (error) {
          // Might be partial data, continue listening
        }
      };

      this.serverProcess.stdout.on('data', onData);
      
      setTimeout(() => {
        this.serverProcess.stdout.off('data', onData);
        reject(new Error('Request timeout'));
      }, 10000);
    });
  }

  async listTools() {
    return this.sendRequest('tools/list');
  }

  async callTool(name, args) {
    return this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }

  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

async function runTests() {
  const client = new MCPClient();

  try {
    console.log('🚀 Starting Gmail MCP Server...');
    await client.start();

    console.log('📋 Listing available tools...');
    const toolsResponse = await client.listTools();
    console.log('Available tools:', toolsResponse.result?.tools?.map(t => t.name) || []);

    console.log('\n📥 Getting inbox emails...');
    const inboxResponse = await client.callTool('get_inbox_emails', {
      maxResults: 5
    });
    console.log('Inbox response:', inboxResponse.result?.content?.[0]?.text || 'No response');

    console.log('\n📤 Getting sent emails...');
    const sentResponse = await client.callTool('get_sent_emails', {
      maxResults: 3
    });
    console.log('Sent emails response:', sentResponse.result?.content?.[0]?.text || 'No response');

    console.log('\n📝 Getting draft emails...');
    const draftResponse = await client.callTool('get_draft_emails', {
      maxResults: 3
    });
    console.log('Draft emails response:', draftResponse.result?.content?.[0]?.text || 'No response');

    console.log('\n🔍 Searching emails with "test" in subject...');
    const searchResponse = await client.callTool('search_emails', {
      query: 'subject:test',
      maxResults: 3
    });
    console.log('Search response:', searchResponse.result?.content?.[0]?.text || 'No response');

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    client.stop();
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { MCPClient, runTests };