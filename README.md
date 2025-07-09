# Gmail MCP Server
A Node.js server that connects the Model Context Protocol (MCP) to Gmail, enabling large language models to send, read, and manage emails securely using the Gmail API.
<p align="center">
   <a href="https://github.com/nisalgunawardhana/Gmail-MCP-Server/watchers">
      <img src="https://img.shields.io/github/watchers/nisalgunawardhana/Gmail-MCP-Server?style=social" alt="Watchers"/>
   </a>
   &nbsp;
   <a href="https://github.com/nisalgunawardhana/Gmail-MCP-Server/stars">
      <img src="https://img.shields.io/github/stars/nisalgunawardhana/Gmail-MCP-Server?style=social" alt="Stars"/>
   </a>
   &nbsp;
   <a href="https://github.com/nisalgunawardhana/Gmail-MCP-Server/network/members">
      <img src="https://img.shields.io/github/forks/nisalgunawardhana/Gmail-MCP-Server?style=social" alt="Forks"/>
   </a>
</p>


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

## Features

- 📤 Send emails through Gmail API
- 📥 Get inbox emails with filtering options
- 🔍 Advanced email search using Gmail query syntax
- 📧 Retrieve specific emails by ID with full content
- 📝 Access draft emails
- 📬 View sent emails
- 📎 Support for HTML and plain text emails
- 📁 Attachment support (send and view)
- 👥 CC and BCC recipients
- 🔐 OAuth2 authentication with Google
- 🛡️ Secure credential management
- ⚡ Fast email operations with metadata caching

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Cloud Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Download the JSON file and rename it to `credentials.json`
   - Place it in the root directory of this project
   
   **Note**: Desktop applications automatically work with the out-of-band authentication flow, so no additional redirect URI configuration is needed.
5. Configure OAuth Consent Screen:
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" user type (unless you have a Google Workspace)
   - Fill in the required fields:
     - App name: "Gmail MCP Server" (or your preferred name)
     - User support email: Your email address
     - Developer contact information: Your email address
   - Add your Gmail address to "Test users" section
   - This allows you to use the app in testing mode

### 3. Authentication Setup

Complete OAuth authentication to allow the server to send emails:

```bash
npm run setup
```

This will:
1. Check that `credentials.json` exists
2. Generate an authorization URL
3. Guide you through the OAuth flow
4. Save the authentication token

#### 🔍 Finding Your Authorization Code

After clicking "Allow" in the Google OAuth screen, you'll be redirected. Here's how to find your authorization code:

**Method 1: Direct Code Display (Most Common for Desktop Apps)**
- After clicking "Allow", Google shows the authorization code directly on a page
- Look for text like "Please copy this code, switch to your application and paste it there:"
- Copy the code from the text box or highlighted area


**Example Authorization Code:**
```
4/0AbCD1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
```

⚠️ **Important**: The code is usually very long (50+ characters) and starts with `4/0`

**Note**: The server reads OAuth credentials directly from `credentials.json`. You don't need to create a `.env` file unless you want to set optional configurations.

### Optional: Environment Configuration

You can optionally create a `.env` file for additional settings:

```env
# Optional: Default sender email (will use authenticated user's email if not set)
DEFAULT_SENDER_EMAIL=your-email@gmail.com

# Optional: Authorization code (for automated setup)
AUTH_CODE=your_auth_code_here
```

Run the server for the first time to complete OAuth authentication:

```bash
npm start
```

Follow the authentication flow in your browser and paste the authorization code when prompted.

## Usage

### MCP Client Configuration

Add this server to your MCP client configuration:

```json
{
  "mcpServers": {
    "gmail": {
      "command": "node",
      "args": ["/path/to/gmail-mcp-server/src/index.js"],
      "env": {}
    }
  }
}
```

### Available Tools

#### send_email

Send an email through Gmail.

**Parameters:**
- `to` (required): Recipient email address(es) - string or array of strings
- `subject` (required): Email subject line
- `body` (required): Email body content
- `cc` (optional): CC recipient email address(es) - string or array of strings  
- `bcc` (optional): BCC recipient email address(es) - string or array of strings
- `html` (optional): Set to true if body contains HTML content (default: false)
- `attachments` (optional): Array of file paths to attach

**Example:**
```json
{
  "name": "send_email",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Hello from MCP Server",
    "body": "This is a test email sent through the Gmail MCP server.",
    "html": false
  }
}
```

#### get_inbox_emails

Retrieve emails from your inbox with optional filtering.

**Parameters:**
- `maxResults` (optional): Maximum number of emails to retrieve (default: 10)
- `query` (optional): Gmail search query to filter emails (default: "in:inbox")
- `includeSpamTrash` (optional): Include spam and trash emails (default: false)

**Example:**
```json
{
  "name": "get_inbox_emails",
  "arguments": {
    "maxResults": 5,
    "query": "is:unread"
  }
}
```

#### get_email_by_id

Get a specific email by its ID with full content including body and attachments.

**Parameters:**
- `emailId` (required): The ID of the email to retrieve
- `format` (optional): Format of the email data - "full", "metadata", or "minimal" (default: "full")

**Example:**
```json
{
  "name": "get_email_by_id",
  "arguments": {
    "emailId": "1234567890abcdef",
    "format": "full"
  }
}
```

#### search_emails

Search emails using Gmail's powerful search query syntax.

**Parameters:**
- `query` (required): Gmail search query (e.g., "from:example@gmail.com", "subject:important", "has:attachment")
- `maxResults` (optional): Maximum number of emails to retrieve (default: 10)

**Example:**
```json
{
  "name": "search_emails",
  "arguments": {
    "query": "from:boss@company.com has:attachment",
    "maxResults": 20
  }
}
```

#### get_sent_emails

Retrieve emails from your sent folder.

**Parameters:**
- `maxResults` (optional): Maximum number of emails to retrieve (default: 10)

**Example:**
```json
{
  "name": "get_sent_emails",
  "arguments": {
    "maxResults": 15
  }
}
```

#### get_draft_emails

Retrieve draft emails.

**Parameters:**
- `maxResults` (optional): Maximum number of draft emails to retrieve (default: 10)

**Example:**
```json
{
  "name": "get_draft_emails",
  "arguments": {
    "maxResults": 5
  }
}
```

### Gmail Search Query Examples

The `search_emails` and `get_inbox_emails` tools support Gmail's powerful search syntax:

- `from:sender@example.com` - Emails from specific sender
- `to:recipient@example.com` - Emails to specific recipient  
- `subject:keyword` - Emails with keyword in subject
- `has:attachment` - Emails with attachments
- `is:unread` - Unread emails
- `is:important` - Important emails
- `newer_than:7d` - Emails newer than 7 days
- `older_than:1m` - Emails older than 1 month
- `size:larger_than:10M` - Emails larger than 10MB

You can combine multiple criteria:
- `from:boss@company.com is:unread has:attachment`
- `subject:meeting newer_than:3d`
- `to:me filename:pdf older_than:1w`

## Security Notes

- OAuth2 tokens are stored locally in `token.json`
- Never commit `credentials.json`, `token.json`, or `.env` files to version control
- The server requires explicit user consent for Gmail access
- All API calls use Google's official Gmail API with proper authentication

## Troubleshooting

### "Insufficient Permission" Errors

**This is the most common issue when upgrading from send-only to full email access.**

**Quick Fix:**
```bash
# Delete old token and re-authenticate
rm token.json
npm run setup
```

**Or use the dedicated re-auth script:**
```bash
npm run reauth
```

**Why this happens:** The original authentication only requested `gmail.send` permission. The new email reading features require additional scopes (`gmail.readonly` and `gmail.modify`).

### OAuth 403: access_denied Error

If you encounter "Error 403: access_denied" or "app is currently being tested", follow these steps:

#### Quick Fix (Recommended for Personal Use):
1. **Add yourself as a test user**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to "APIs & Services" > "OAuth consent screen"
   - Scroll down to "Test users" section
   - Click "ADD USERS" and add your Gmail address
   - Save the changes

2. **Ensure correct user type**:
   - In OAuth consent screen, make sure you selected "External" user type
   - If you selected "Internal" but don't have Google Workspace, change to "External"

3. **Clear browser cache and try again**:
   - Clear your browser's cache and cookies for Google accounts
   - Try the authentication flow again

#### Alternative: Use App Passwords (Gmail Specific)
If OAuth continues to be problematic, you can use Gmail App Passwords:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
3. **Use SMTP instead of Gmail API** (requires code modification)

#### For Production Use:
To remove the testing limitation permanently:
1. Complete the OAuth consent screen with all required information
2. Submit for Google verification (takes 1-4 weeks)
3. Provide privacy policy, terms of service, and app homepage
4. Once verified, any Gmail user can authorize your app

### Other Common Issues

#### "credentials.json not found"
- Ensure the file is in the project root directory
- Check the filename is exactly `credentials.json`
- Verify the file contains valid JSON

#### "Token refresh failed"
- Delete `token.json` file
- Run `npm run setup` to re-authenticate
- Ensure your OAuth2 credentials are still valid

#### "Gmail API not enabled"
- Go to Google Cloud Console
- Navigate to "APIs & Services" > "Library"
- Search for "Gmail API" and ensure it's enabled

## 🔄 Important: Re-authentication Required for Email Reading

**If you previously set up this server for sending emails only**, you'll need to re-authenticate to access inbox and email reading features. The original setup only requested `gmail.send` permission, but the new features require additional scopes.

### Quick Fix for "Insufficient Permission" Errors:

1. **Delete the existing token**:
   ```bash
   rm token.json
   ```

2. **Re-run the setup** (this will request the additional permissions):
   ```bash
   npm run setup
   ```

3. **Follow the OAuth flow again** - this time it will request permissions for:
   - Send emails (`gmail.send`) 
   - Read emails (`gmail.readonly`)
   - Modify emails (`gmail.modify`)

### Alternative: Force Re-authentication Script

If you prefer a dedicated script:
```bash
npm run reauth
```

## Development

```bash
# Start with auto-reload
npm run dev

# Run tests
npm run test
```

## Contributing

We welcome contributions to the Gmail MCP Server! Here's how you can help:

### 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/email-mcp-server.git
   cd email-mcp-server
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up authentication** (see Setup section above):
   ```bash
   npm run setup
   ```

### 🔧 Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our coding standards
3. **Test your changes**:
   ```bash
   npm run test
   ```
4. **Run the server locally** to verify functionality:
   ```bash
   npm run dev
   ```
5. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m "feat: add support for email labels"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request** on GitHub

### 📝 Coding Standards

- **JavaScript Style**: Use modern ES6+ syntax
- **Formatting**: Run `npm run lint` (if available) before committing
- **Comments**: Add JSDoc comments for functions and complex logic
- **Error Handling**: Always include proper error handling and validation
- **Security**: Never log or expose sensitive credentials

### 🧪 Testing Guidelines

- **Write tests** for new features in the `test/` directory
- **Test email functionality** with the provided test scripts:
  ```bash
  node test/send-test-email.js
  node test/email-operations-test.js
  ```
- **Verify MCP integration** with the test client:
  ```bash
  node test/mcp-test-client.js
  ```

### 📋 What We're Looking For

**High Priority:**
- 📎 Enhanced attachment handling (multiple files, size limits)
- 🏷️ Email label management (create, apply, remove labels)
- 📤 Draft management (create, edit, send drafts)
- 🔄 Real-time email notifications via webhooks
- 📊 Email analytics and reporting features

**Medium Priority:**
- 🎨 HTML email template support
- 📋 Email signature management
- 🔍 Advanced search filters and sorting
- 📱 Mobile-friendly authentication flow
- 🌐 Multi-language support

**Always Welcome:**
- 🐛 Bug fixes and security improvements
- 📚 Documentation enhancements
- ⚡ Performance optimizations
- 🧪 Additional test coverage

### 🐛 Reporting Issues

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Environment details**:
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Operating system
5. **Error messages** or logs (remove sensitive information)
6. **Code snippets** if relevant

### 📋 Issue Templates

We provide issue templates to help you report bugs and request features effectively:

#### 🐛 Bug Report Template
Use this template when reporting bugs or unexpected behavior:
- **Summary**: Brief description of the issue
- **Environment**: Node.js version, OS, npm version
- **Steps to Reproduce**: Numbered steps to recreate the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Error Messages**: Any error logs or messages
- **Additional Context**: Screenshots, code snippets, or other relevant info

#### ✨ Feature Request Template
Use this template when suggesting new features:
- **Feature Summary**: Brief description of the proposed feature
- **Problem Statement**: What problem does this solve?
- **Proposed Solution**: How should this feature work?
- **Use Case**: Real-world scenarios where this would be helpful
- **Alternatives Considered**: Other solutions you've thought about
- **Additional Context**: Mockups, examples, or references

#### 📚 Documentation Issue Template
Use this template for documentation improvements:
- **Documentation Section**: Which part needs improvement
- **Issue Description**: What's unclear or missing
- **Suggested Improvement**: How to make it better
- **Target Audience**: Who would benefit from this change

#### 🔧 How to Create an Issue

1. **Visit the Issues page**: Go to the repository's [Issues tab](https://github.com/nisalgunawardhana/email-mcp-server/issues)
2. **Click "New Issue"**: Start creating a new issue
3. **Choose a template**: Select the appropriate template (Bug Report, Feature Request, etc.)
4. **Fill out the template**: Complete all relevant sections
5. **Add labels**: Apply appropriate labels (bug, enhancement, documentation, etc.)
6. **Submit**: Click "Submit new issue"

#### 📝 Issue Labels Guide

We use these labels to categorize issues:

**Type Labels:**
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `question` - Further information is requested
- `help wanted` - Extra attention is needed
- `good first issue` - Good for newcomers

**Priority Labels:**
- `priority: high` - Critical issues that need immediate attention
- `priority: medium` - Important issues that should be addressed soon
- `priority: low` - Nice-to-have improvements

**Component Labels:**
- `gmail-api` - Related to Gmail API integration
- `authentication` - OAuth and credential management
- `mcp` - Model Context Protocol functionality
- `testing` - Test-related issues
- `security` - Security-related concerns

#### 🔍 Before Creating an Issue

**Search First**: Check if someone has already reported the same issue or requested the same feature.

**For Bugs:**
- Try the latest version to see if the issue is already fixed
- Check the troubleshooting section in the README
- Test with different configurations if possible

**For Features:**
- Consider if this fits the project's scope and goals
- Think about how it would affect existing functionality
- Look for similar features in related projects

### 💡 Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** and why it's valuable
3. **Provide examples** of how it would work
4. **Consider backwards compatibility**

### 🏷️ Commit Message Format

We follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(gmail): add support for email labels
fix(auth): handle token refresh edge case
docs(readme): update API documentation
test(email): add unit tests for validation
```

### 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

### 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the golden rule

### ❓ Questions?

- Open an issue for questions about the codebase
- Check existing documentation first
- Be specific about what you're trying to achieve

## 👤 Author

**Nisal Gunawardhana**

- [GitHub](https://github.com/nisalgunawardhana) &nbsp; [![Follow on GitHub](https://img.shields.io/github/followers/nisalgunawardhana?label=Follow&style=social)](https://github.com/nisalgunawardhana)
- [Twitter/X](https://twitter.com/thenisal)  
- [LinkedIn](https://www.linkedin.com/in/nisalgunawardhana/)

Feel free to connect or follow for updates and new projects!

Thank you for contributing to Gmail MCP Server! 🚀
