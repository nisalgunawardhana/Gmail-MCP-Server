# Gmail MCP Server - Client Integration Guide

This guide provides step-by-step instructions for connecting the Gmail MCP Server with various MCP clients, including GitHub Copilot, VS Code with Claude, desktop applications, and other popular clients.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [General Connection Steps](#general-connection-steps)
- [Client-Specific Integration](#client-specific-integration)
  - [GitHub Copilot](#github-copilot)
  - [VS Code with Claude Desktop](#vs-code-with-claude-desktop)
  - [Claude Desktop (Standalone)](#claude-desktop-standalone)
  - [Continue.dev Extension](#continuedev-extension)
  - [Custom MCP Clients](#custom-mcp-clients)
- [Configuration Templates](#configuration-templates)
- [Testing Your Connection](#testing-your-connection)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before connecting to any MCP client, ensure your Gmail MCP Server is properly set up:

1. **Server Setup Complete**: Follow the main README.md setup instructions
2. **Authentication Working**: Run `npm run check` to verify Gmail API access
3. **Server Running**: The MCP server should be accessible via stdio or network
4. **Node.js Version**: Ensure you're using Node.js 18.0.0 or higher

## 🔄 General Connection Steps

### 1. Start the MCP Server

```bash
# Navigate to your email-mcp-server directory
cd /path/to/email-mcp-server

# Start the server
npm start
```

### 2. Locate Your Server Path

Note the absolute path to your MCP server:
```bash
pwd
# Example output: /Users/yourusername/email-mcp-server
```

### 3. Identify Connection Method

The Gmail MCP Server supports:
- **Stdio Transport**: Direct process communication (recommended)
- **Network Transport**: TCP/WebSocket connections (for remote access)

## 🔗 Client-Specific Integration

### GitHub Copilot

GitHub Copilot with MCP support requires configuration through VS Code or your IDE.

#### VS Code Setup

1. **Install GitHub Copilot Extension**:
   ```bash
   code --install-extension GitHub.copilot
   ```

2. **Create MCP Configuration**:
   Create or update `.vscode/settings.json` in your workspace:
   ```json
   {
     "github.copilot.advanced": {
       "mcp": {
         "servers": {
           "gmail": {
             "command": "node",
             "args": ["src/index.js"],
             "cwd": "/absolute/path/to/email-mcp-server",
             "env": {}
           }
         }
       }
     }
   }
   ```

3. **Restart VS Code** and verify the connection in the Copilot panel.

#### CLI Setup (if supported)

```bash
# Add to your copilot configuration
gh copilot config set mcp.servers.gmail.command "node /absolute/path/to/email-mcp-server/src/index.js"
```

### VS Code with Claude Desktop

#### Method 1: Using Claude Desktop Extension

1. **Install Claude for VS Code**:
   ```bash
   code --install-extension Anthropic.claude-dev
   ```

2. **Configure MCP in VS Code Settings**:
   Add to your VS Code `settings.json`:
   ```json
   {
     "claude.mcpServers": {
       "gmail": {
         "command": "node",
         "args": ["src/index.js"],
         "cwd": "/absolute/path/to/email-mcp-server"
       }
     }
   }
   ```

#### Method 2: Using Integrated Terminal

1. **Open VS Code Terminal**
2. **Start MCP Server**:
   ```bash
   cd /path/to/email-mcp-server
   npm start
   ```
3. **Connect Claude** through the command palette (Ctrl/Cmd + Shift + P):
   - Search for "Claude: Connect to MCP Server"
   - Select "gmail" from the available servers

### Claude Desktop (Standalone)

#### Configuration File Setup

1. **Locate Claude Desktop Config**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add Gmail MCP Server Configuration**:
   ```json
   {
     "mcpServers": {
       "gmail": {
         "command": "node",
         "args": ["src/index.js"],
         "cwd": "/absolute/path/to/email-mcp-server",
         "env": {}
       }
     }
   }
   ```

3. **Restart Claude Desktop** to load the new configuration.

#### Alternative: Network Connection

If you prefer network-based connection:

1. **Start Server with Network Transport**:
   ```bash
   # Modify src/index.js to use network transport
   npm run start -- --transport=network --port=3001
   ```

2. **Configure Claude Desktop**:
   ```json
   {
     "mcpServers": {
       "gmail": {
         "url": "ws://localhost:3001",
         "transport": "websocket"
       }
     }
   }
   ```

### Continue.dev Extension

Continue.dev is a popular VS Code extension for AI-powered coding.

1. **Install Continue Extension**:
   ```bash
   code --install-extension Continue.continue
   ```

2. **Configure MCP in Continue Settings**:
   Open Continue settings and add:
   ```json
   {
     "mcpServers": [
       {
         "name": "gmail",
         "command": "node",
         "args": ["src/index.js"],
         "cwd": "/absolute/path/to/email-mcp-server"
       }
     ]
   }
   ```

3. **Restart VS Code** and access Gmail tools through Continue's interface.

### Custom MCP Clients

#### Node.js Client Example

```javascript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Create transport
const serverProcess = spawn('node', ['src/index.js'], {
  cwd: '/absolute/path/to/email-mcp-server',
  stdio: ['pipe', 'pipe', 'inherit']
});

const transport = new StdioClientTransport({
  reader: serverProcess.stdout,
  writer: serverProcess.stdin
});

// Create client
const client = new Client({
  name: "gmail-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

// Connect and use
await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools);

// Send an email
const result = await client.callTool('send_email', {
  to: 'recipient@example.com',
  subject: 'Test from MCP',
  body: 'Hello from Gmail MCP Server!'
});
```

#### Python Client Example

```python
import asyncio
import subprocess
from mcp.client import stdio

async def main():
    # Start the MCP server
    proc = subprocess.Popen([
        'node', 'src/index.js'
    ], cwd='/absolute/path/to/email-mcp-server', 
       stdin=subprocess.PIPE, 
       stdout=subprocess.PIPE)
    
    # Connect via stdio
    async with stdio.stdio_client(proc) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize the connection
            await session.initialize()
            
            # List available tools
            tools = await session.list_tools()
            print(f"Available tools: {tools}")
            
            # Send an email
            result = await session.call_tool("send_email", {
                "to": "recipient@example.com",
                "subject": "Test from Python MCP Client",
                "body": "Hello from Python!"
            })
            print(f"Email sent: {result}")

asyncio.run(main())
```

## 📄 Configuration Templates

### Standard MCP Configuration

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "/absolute/path/to/email-mcp-server",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Development Configuration

```json
{
  "mcpServers": {
    "gmail-dev": {
      "command": "node",
      "args": ["--watch", "src/index.js"],
      "cwd": "/absolute/path/to/email-mcp-server",
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    }
  }
}
```

### Network-based Configuration

```json
{
  "mcpServers": {
    "gmail-remote": {
      "url": "ws://localhost:3001",
      "transport": "websocket"
    }
  }
}
```

## 🧪 Testing Your Connection

### 1. Basic Connection Test

Use the built-in test client:
```bash
cd /path/to/email-mcp-server
npm run test:mcp
```

### 2. Tool Availability Test

In your MCP client, verify available tools:
- `send_email` - Send Gmail messages
- `read_emails` - Read inbox messages
- `search_emails` - Search Gmail
- `get_email_details` - Get specific email details

### 3. Functional Test

Send a test email:
```bash
npm run test:email
```

### 4. Client-Specific Tests

#### Claude Desktop Test
1. Open Claude Desktop
2. Type: "List the available MCP tools"
3. Verify Gmail tools appear
4. Try: "Send a test email to myself"

#### VS Code Test
1. Open command palette (Ctrl/Cmd + Shift + P)
2. Look for MCP-related commands
3. Check if Gmail server is listed as connected

## 🔧 Troubleshooting

### Common Issues

#### 1. Server Not Found
**Symptoms**: Client can't connect to Gmail MCP server
**Solutions**:
- Verify the absolute path in configuration
- Check Node.js is installed and accessible
- Ensure all dependencies are installed (`npm install`)

#### 2. Authentication Errors
**Symptoms**: "Gmail API authentication failed"
**Solutions**:
- Run `npm run check` to verify setup
- Re-run authentication: `npm run reauth`
- Check credentials.json file exists and is valid

#### 3. Permission Denied
**Symptoms**: "Insufficient permissions for Gmail API"
**Solutions**:
- Verify Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen configuration
- Run `npm run check:permissions`

#### 4. Connection Timeout
**Symptoms**: Client connection times out
**Solutions**:
- Check server starts successfully: `npm start`
- Verify no port conflicts (if using network transport)
- Check firewall settings

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm start
```

Or set environment variable in client configuration:
```json
{
  "env": {
    "DEBUG": "mcp:*"
  }
}
```

### Log Analysis

Check logs for connection issues:
```bash
# Server logs
tail -f /path/to/email-mcp-server/logs/server.log

# Client logs (varies by client)
# Claude Desktop: Check Console in developer tools
# VS Code: Check Output panel -> MCP
```

## 🔒 Security Considerations

### 1. Credential Security
- Never commit `credentials.json` or `token.json` to version control
- Use environment variables for sensitive data in production
- Regularly rotate OAuth tokens

### 2. Network Security
- Use HTTPS/WSS for network connections
- Implement proper authentication for remote access
- Consider VPN for remote MCP connections

### 3. Access Control
- Limit Gmail API scopes to minimum required
- Implement rate limiting in the server
- Monitor email sending patterns

## 📚 Additional Resources

- [MCP Official Documentation](https://github.com/modelcontextprotocol/specification)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Node.js MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## 🤝 Support

If you encounter issues not covered in this guide:

1. **Check existing issues**: [GitHub Issues](https://github.com/nisalgunawardhana/email-mcp-server/issues)
2. **Create a new issue**: Provide detailed error messages and configuration
3. **Community support**: Join MCP community discussions

---

**Need help?** Open an issue on GitHub or refer to the main [README.md](./README.md) for additional setup instructions.
