---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: ['bug']
assignees: ''
---

## 🐛 Bug Report

### Summary
A clear and concise description of what the bug is.

### Environment
- **Node.js version**: (run `node --version`)
- **npm version**: (run `npm --version`)
- **Operating System**: (e.g., macOS 12.0, Windows 11, Ubuntu 20.04)
- **Gmail MCP Server version**: (check package.json or git tag)

### Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected Behavior
A clear and concise description of what you expected to happen.

### Actual Behavior
A clear and concise description of what actually happened.

### Error Messages
```
Paste any error messages or logs here (remove sensitive information like emails or credentials)
```

### Code Snippets
```javascript
// If applicable, add code snippets that reproduce the issue
```

### Configuration
```json
// Your MCP client configuration (remove sensitive data)
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

### Additional Context
Add any other context about the problem here:
- Screenshots
- Related issues
- Workarounds you've tried
- Impact on your workflow

### Checklist
- [ ] I have checked the existing issues to make sure this is not a duplicate
- [ ] I have read the troubleshooting section in the README
- [ ] I have tested with the latest version
- [ ] I have removed all sensitive information from this report
