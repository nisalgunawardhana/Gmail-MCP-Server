# Gmail MCP Server - Quick Start Guide

## 🚀 What You Just Created

You now have a complete **Model Context Protocol (MCP) server** that enables large language models to send Gmail messages! This server acts as a bridge between AI models and Gmail's API, allowing LLMs to compose and send emails on your behalf.

## 📁 Project Structure

```
email-mcp-server/
├── src/
│   ├── index.js              # Main MCP server entry point
│   ├── gmail-service.js      # Gmail API integration
│   └── validation.js         # Input validation and sanitization
├── test/
│   └── test.js              # Basic functionality tests
├── examples/
│   └── usage-examples.md    # Usage examples and integration guides
├── package.json             # Project dependencies and scripts
├── setup-auth.js           # Authentication setup helper
├── mcp-config.json         # MCP client configuration template
├── credentials.json.template # Google OAuth credentials template
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # Comprehensive documentation
```

## 🔧 Next Steps to Get Started

### 1. Set Up Google Cloud Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create a new project or select existing one
3. **Enable Gmail API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. **Create OAuth2 Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the JSON file as `credentials.json`
   - Place it in the project root directory

### 2. Run Authentication Setup

```bash
npm run setup
```

This will guide you through the OAuth2 authentication process.

### 3. Configure Your MCP Client

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": ["/Users/nisalgunawardhana/Desktop/email-mcp-server/src/index.js"],
      "env": {}
    }
  }
}
```

### 4. Start Using It!

Once configured, you can ask your LLM to send emails:

> "Send an email to john@example.com with the subject 'Meeting Tomorrow' and tell him the meeting is at 2 PM in conference room A."

## 🔧 Available Commands

- `npm start` - Start the MCP server
- `npm run dev` - Start with auto-reload for development
- `npm run setup` - Interactive authentication setup
- `npm run check` - Check your setup configuration
- `npm test` - Run basic functionality tests

## 🛠️ Key Features

- ✅ **OAuth2 Authentication** - Secure Google authentication
- ✅ **Plain Text & HTML Emails** - Support for both formats
- ✅ **Multiple Recipients** - Send to multiple people at once
- ✅ **CC & BCC Support** - Include CC and BCC recipients
- ✅ **File Attachments** - Attach files to emails
- ✅ **Input Validation** - Robust email validation and sanitization
- ✅ **Error Handling** - Comprehensive error messages and recovery
- ✅ **MCP Compatible** - Works with any MCP-compatible client

## 🔒 Security Features

- **OAuth2 Flow**: Secure authentication with Google
- **Token Management**: Automatic token refresh and storage
- **Input Sanitization**: HTML content is sanitized for security
- **Email Validation**: Comprehensive email address validation
- **Scope Limitation**: Only requests Gmail send permissions

## 📖 Integration Examples

### With Claude Desktop
Perfect for natural language email composition and sending.

### With Custom LLM Applications
Use the MCP protocol to integrate email sending into any application.

### With Automation Scripts
Combine with other MCP servers for complex workflows.

## 🎯 Use Cases

- **AI Email Assistant**: Let AI compose and send emails
- **Automated Notifications**: Send system notifications via email
- **Newsletter Distribution**: AI-powered newsletter creation and sending
- **Customer Support**: Automated email responses
- **Project Updates**: Automated status updates to team members

## 🛟 Troubleshooting

### Authentication Issues
- Ensure `credentials.json` is in the project root
- Run `npm run setup` to complete OAuth flow
- Check that Gmail API is enabled in Google Cloud Console

### Permission Errors
- Verify OAuth2 scope includes Gmail send permissions
- Re-run authentication if tokens are expired

### Email Sending Failures
- Check recipient email addresses for validity
- Ensure attachment files exist and are accessible
- Verify internet connectivity

## 📚 Further Reading

- Check `examples/usage-examples.md` for detailed usage examples
- Review `README.md` for comprehensive documentation
- See Google's Gmail API documentation for advanced features

---

**🎉 Congratulations!** You now have a fully functional Gmail MCP server that can integrate with any large language model supporting the MCP protocol. The server provides a secure, robust way for AI models to send emails on your behalf while maintaining proper authentication and validation.
