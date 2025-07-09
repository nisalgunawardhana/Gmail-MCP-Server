#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { GmailService } from './gmail-service.js';
import { EmailValidationSchema, sanitizeEmailContent } from './validation.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class GmailMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'gmail-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.gmailService = new GmailService();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'send_email',
            description: 'Send an email through Gmail API. Supports HTML content, attachments, CC/BCC recipients.',
            inputSchema: {
              type: 'object',
              properties: {
                to: {
                  type: ['string', 'array'],
                  items: { type: 'string' },
                  description: 'Recipient email address(es)',
                },
                subject: {
                  type: 'string',
                  description: 'Email subject line',
                },
                body: {
                  type: 'string',
                  description: 'Email body content',
                },
                cc: {
                  type: ['string', 'array'],
                  items: { type: 'string' },
                  description: 'CC recipient email address(es)',
                },
                bcc: {
                  type: ['string', 'array'],
                  items: { type: 'string' },
                  description: 'BCC recipient email address(es)',
                },
                html: {
                  type: 'boolean',
                  description: 'Whether the body contains HTML content',
                  default: false,
                },
                attachments: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of file paths to attach',
                },
              },
              required: ['to', 'subject', 'body'],
            },
          },
          {
            name: 'get_inbox_emails',
            description: 'Get emails from the inbox. Returns a list of emails with metadata.',
            inputSchema: {
              type: 'object',
              properties: {
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of emails to retrieve (default: 10)',
                  default: 10,
                },
                query: {
                  type: 'string',
                  description: 'Gmail search query (default: "in:inbox")',
                  default: 'in:inbox',
                },
                includeSpamTrash: {
                  type: 'boolean',
                  description: 'Include spam and trash emails',
                  default: false,
                },
              },
              required: [],
            },
          },
          {
            name: 'get_email_by_id',
            description: 'Get a specific email by its ID with full content including body and attachments.',
            inputSchema: {
              type: 'object',
              properties: {
                emailId: {
                  type: 'string',
                  description: 'The ID of the email to retrieve',
                },
                format: {
                  type: 'string',
                  description: 'Format of the email data (full, metadata, minimal)',
                  default: 'full',
                },
              },
              required: ['emailId'],
            },
          },
          {
            name: 'search_emails',
            description: 'Search emails using Gmail search query syntax.',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Gmail search query (e.g., "from:example@gmail.com", "subject:important", "has:attachment")',
                },
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of emails to retrieve (default: 10)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_sent_emails',
            description: 'Get emails from the sent folder.',
            inputSchema: {
              type: 'object',
              properties: {
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of emails to retrieve (default: 10)',
                  default: 10,
                },
              },
              required: [],
            },
          },
          {
            name: 'get_draft_emails',
            description: 'Get draft emails.',
            inputSchema: {
              type: 'object',
              properties: {
                maxResults: {
                  type: 'number',
                  description: 'Maximum number of draft emails to retrieve (default: 10)',
                  default: 10,
                },
              },
              required: [],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'send_email') {
          // Validate arguments
          const validatedArgs = EmailValidationSchema.parse(args);
          
          // Sanitize email content
          validatedArgs.body = sanitizeEmailContent(validatedArgs.body, validatedArgs.html);
          
          // Send email
          const result = await this.gmailService.sendEmail(validatedArgs);
          
          return {
            content: [
              {
                type: 'text',
                text: `Email sent successfully! Message ID: ${result.messageId}`,
              },
            ],
          };
        } else if (name === 'get_inbox_emails') {
          const emails = await this.gmailService.getInboxEmails(args);
          
          return {
            content: [
              {
                type: 'text',
                text: `Found ${emails.length} emails in inbox:\n\n${emails.map(email => 
                  `📧 ${email.subject || '(No Subject)'}\n` +
                  `From: ${email.from}\n` +
                  `Date: ${email.date}\n` +
                  `ID: ${email.id}\n` +
                  `Snippet: ${email.snippet}\n`
                ).join('\n---\n')}`,
              },
            ],
          };
        } else if (name === 'get_email_by_id') {
          const email = await this.gmailService.getEmailById(args.emailId, args.format);
          
          return {
            content: [
              {
                type: 'text',
                text: `📧 Email Details:\n\n` +
                      `Subject: ${email.subject || '(No Subject)'}\n` +
                      `From: ${email.from}\n` +
                      `To: ${email.to}\n` +
                      `${email.cc ? `CC: ${email.cc}\n` : ''}` +
                      `Date: ${email.date}\n` +
                      `ID: ${email.id}\n` +
                      `Thread ID: ${email.threadId}\n` +
                      `${email.attachments.length > 0 ? `Attachments: ${email.attachments.map(a => a.filename).join(', ')}\n` : ''}` +
                      `\nBody:\n${email.body || email.snippet}`,
              },
            ],
          };
        } else if (name === 'search_emails') {
          const emails = await this.gmailService.searchEmails(args.query, args.maxResults);
          
          return {
            content: [
              {
                type: 'text',
                text: `🔍 Search Results for "${args.query}":\n\nFound ${emails.length} emails:\n\n${emails.map(email => 
                  `📧 ${email.subject || '(No Subject)'}\n` +
                  `From: ${email.from}\n` +
                  `Date: ${email.date}\n` +
                  `ID: ${email.id}\n` +
                  `Snippet: ${email.snippet}\n`
                ).join('\n---\n')}`,
              },
            ],
          };
        } else if (name === 'get_sent_emails') {
          const emails = await this.gmailService.getSentEmails(args.maxResults);
          
          return {
            content: [
              {
                type: 'text',
                text: `📤 Sent Emails:\n\nFound ${emails.length} sent emails:\n\n${emails.map(email => 
                  `📧 ${email.subject || '(No Subject)'}\n` +
                  `To: ${email.to}\n` +
                  `Date: ${email.date}\n` +
                  `ID: ${email.id}\n` +
                  `Snippet: ${email.snippet}\n`
                ).join('\n---\n')}`,
              },
            ],
          };
        } else if (name === 'get_draft_emails') {
          const drafts = await this.gmailService.getDraftEmails(args.maxResults);
          
          return {
            content: [
              {
                type: 'text',
                text: `📝 Draft Emails:\n\nFound ${drafts.length} draft emails:\n\n${drafts.map(draft => 
                  `📧 ${draft.message.subject || '(No Subject)'}\n` +
                  `To: ${draft.message.to}\n` +
                  `Date: ${draft.message.date}\n` +
                  `Draft ID: ${draft.id}\n` +
                  `Snippet: ${draft.message.snippet}\n`
                ).join('\n---\n')}`,
              },
            ],
          };
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    try {
      // Initialize Gmail service
      await this.gmailService.initialize();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
      console.error('Gmail MCP Server running on stdio');
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new GmailMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
