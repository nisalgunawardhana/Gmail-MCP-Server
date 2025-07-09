# Email Operations Examples

This document provides examples of how to use the enhanced Gmail MCP Server with inbox, search, and email management capabilities.

## Available Tools

1. **send_email** - Send an email through Gmail API
2. **get_inbox_emails** - Get emails from the inbox  
3. **get_email_by_id** - Get a specific email by its ID with full content
4. **search_emails** - Search emails using Gmail search query syntax
5. **get_sent_emails** - Get emails from the sent folder
6. **get_draft_emails** - Get draft emails

## Examples

### 1. Get Inbox Emails

Get the latest 10 emails from inbox:
```json
{
  "tool": "get_inbox_emails",
  "arguments": {
    "maxResults": 10
  }
}
```

Get unread emails only:
```json
{
  "tool": "get_inbox_emails",
  "arguments": {
    "query": "in:inbox is:unread",
    "maxResults": 5
  }
}
```

### 2. Search Emails

Search for emails from a specific sender:
```json
{
  "tool": "search_emails",
  "arguments": {
    "query": "from:example@gmail.com",
    "maxResults": 10
  }
}
```

Search for emails with attachments:
```json
{
  "tool": "search_emails",
  "arguments": {
    "query": "has:attachment",
    "maxResults": 5
  }
}
```

Search for emails with specific subject:
```json
{
  "tool": "search_emails",
  "arguments": {
    "query": "subject:meeting",
    "maxResults": 10
  }
}
```

Search for emails from last week:
```json
{
  "tool": "search_emails",
  "arguments": {
    "query": "newer_than:7d",
    "maxResults": 20
  }
}
```

### 3. Get Specific Email

Get full email content by ID:
```json
{
  "tool": "get_email_by_id",
  "arguments": {
    "emailId": "1234567890abcdef",
    "format": "full"
  }
}
```

### 4. Get Sent Emails

Get latest sent emails:
```json
{
  "tool": "get_sent_emails",
  "arguments": {
    "maxResults": 5
  }
}
```

### 5. Get Draft Emails

Get all draft emails:
```json
{
  "tool": "get_draft_emails",
  "arguments": {
    "maxResults": 10
  }
}
```

### 6. Send Email (Enhanced)

Send a simple email:
```json
{
  "tool": "send_email",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Test Email",
    "body": "This is a test email."
  }
}
```

Send HTML email with CC and BCC:
```json
{
  "tool": "send_email",
  "arguments": {
    "to": ["recipient1@example.com", "recipient2@example.com"],
    "cc": "cc@example.com",
    "bcc": "bcc@example.com",
    "subject": "HTML Email Test",
    "body": "<h1>Hello!</h1><p>This is an <strong>HTML</strong> email.</p>",
    "html": true
  }
}
```

Send email with attachments:
```json
{
  "tool": "send_email",
  "arguments": {
    "to": "recipient@example.com",
    "subject": "Email with Attachments",
    "body": "Please find the attached files.",
    "attachments": ["/path/to/file1.pdf", "/path/to/file2.jpg"]
  }
}
```

## Gmail Search Query Syntax

The search functionality supports Gmail's powerful search syntax:

- `from:sender@example.com` - Emails from specific sender
- `to:recipient@example.com` - Emails to specific recipient
- `subject:keyword` - Emails with keyword in subject
- `has:attachment` - Emails with attachments
- `is:unread` - Unread emails
- `is:important` - Important emails
- `in:inbox` - Emails in inbox
- `in:sent` - Emails in sent folder
- `in:draft` - Draft emails
- `newer_than:7d` - Emails newer than 7 days
- `older_than:1m` - Emails older than 1 month
- `size:larger_than:10M` - Emails larger than 10MB
- `filename:pdf` - Emails with PDF attachments

You can combine multiple criteria:
- `from:boss@company.com is:unread has:attachment`
- `subject:meeting newer_than:3d`
- `to:me filename:pdf older_than:1w`

## Error Handling

All tools include comprehensive error handling and will return descriptive error messages if something goes wrong:

- Authentication errors
- Invalid email IDs
- Network connectivity issues
- Gmail API quota limits
- Invalid search queries

## Tips

1. Start with small `maxResults` values when testing
2. Use specific search queries to find what you need quickly
3. The `get_email_by_id` tool with `format: "full"` provides complete email content including body and attachments
4. Draft emails are separate from regular emails and require the specific `get_draft_emails` tool
5. Remember that Gmail search is case-insensitive
6. Use the `snippet` field for quick email previews without fetching full content