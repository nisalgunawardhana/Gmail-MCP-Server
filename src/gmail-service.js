import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GmailService {
  constructor() {
    this.gmail = null;
    this.auth = null;
    this.credentialsPath = path.join(__dirname, '..', 'credentials.json');
    this.tokenPath = path.join(__dirname, '..', 'token.json');
  }

  async initialize() {
    try {
      // Load client secrets from credentials file
      const credentials = await this.loadCredentials();
      
      // Create OAuth2 client
      this.auth = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        'urn:ietf:wg:oauth:2.0:oob' // Always use out-of-band flow for desktop apps
      );

      // Load existing token or get new one
      await this.loadOrGetToken();

      // Create Gmail API instance
      this.gmail = google.gmail({ version: 'v1', auth: this.auth });

      console.error('Gmail service initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize Gmail service: ${error.message}`);
    }
  }

  async loadCredentials() {
    try {
      const content = await fs.readFile(this.credentialsPath, 'utf8');
      const credentials = JSON.parse(content);
      
      // Handle both desktop and web application credential formats
      if (credentials.installed) {
        return {
          client_id: credentials.installed.client_id,
          client_secret: credentials.installed.client_secret,
          redirect_uris: credentials.installed.redirect_uris,
        };
      } else if (credentials.web) {
        return {
          client_id: credentials.web.client_id,
          client_secret: credentials.web.client_secret,
          redirect_uris: credentials.web.redirect_uris,
        };
      } else {
        throw new Error('Invalid credentials format');
      }
    } catch (error) {
      throw new Error(`Failed to load credentials: ${error.message}. Please ensure credentials.json exists in the project root.`);
    }
  }

  async loadOrGetToken() {
    try {
      // Try to load existing token
      const tokenContent = await fs.readFile(this.tokenPath, 'utf8');
      const token = JSON.parse(tokenContent);
      this.auth.setCredentials(token);
      
      // Check if token needs refresh
      if (token.expiry_date && token.expiry_date <= Date.now()) {
        await this.refreshToken();
      }
    } catch (error) {
      // Token doesn't exist or is invalid, get new one
      await this.getNewToken();
    }
  }

  async getNewToken() {
    // Check if we have an auth code from environment
    const authCode = process.env.AUTH_CODE;
    
    if (authCode) {
      try {
        const { tokens } = await this.auth.getToken(authCode);
        this.auth.setCredentials(tokens);
        await fs.writeFile(this.tokenPath, JSON.stringify(tokens, null, 2));
        console.error('✅ Token saved successfully');
        return;
      } catch (error) {
        if (error.message.includes('access_denied') || error.message.includes('403')) {
          throw new Error(`OAuth access denied. This usually means:
1. Your app is in testing mode and you need to add yourself as a test user
2. Go to Google Cloud Console > OAuth consent screen > Test users
3. Add your Gmail address to the test users list
4. Try authentication again

Original error: ${error.message}`);
        }
        throw new Error(`Failed to exchange auth code: ${error.message}`);
      }
    }

    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
    });

    throw new Error(`Authentication required. Please run 'npm run setup' first or visit: ${authUrl}`);
  }

  async refreshToken() {
    try {
      const { credentials } = await this.auth.refreshAccessToken();
      this.auth.setCredentials(credentials);
      await fs.writeFile(this.tokenPath, JSON.stringify(credentials));
    } catch (error) {
      throw new Error(`Failed to refresh token: ${error.message}`);
    }
  }

  async sendEmail(emailData) {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const message = await this.createMessage(emailData);
      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      return {
        messageId: response.data.id,
        threadId: response.data.threadId,
      };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async createMessage(emailData) {
    const { to, subject, body, cc, bcc, html, attachments } = emailData;

    // Convert recipients to arrays if they're strings
    const toArray = Array.isArray(to) ? to : [to];
    const ccArray = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
    const bccArray = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : [];

    // Create email headers
    let headers = [
      `To: ${toArray.join(', ')}`,
      `Subject: ${subject}`,
    ];

    if (ccArray.length > 0) {
      headers.push(`Cc: ${ccArray.join(', ')}`);
    }

    if (bccArray.length > 0) {
      headers.push(`Bcc: ${bccArray.join(', ')}`);
    }

    let emailContent;

    if (attachments && attachments.length > 0) {
      // Create multipart message with attachments
      const boundary = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      headers.push(`MIME-Version: 1.0`);
      headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);

      let parts = [];

      // Add text/html part
      parts.push(`--${boundary}`);
      parts.push(`Content-Type: ${html ? 'text/html' : 'text/plain'}; charset=utf-8`);
      parts.push(`Content-Transfer-Encoding: base64`);
      parts.push('');
      parts.push(Buffer.from(body, 'utf-8').toString('base64'));

      // Add attachments
      for (const attachmentPath of attachments) {
        try {
          const fileName = path.basename(attachmentPath);
          const fileContent = await fs.readFile(attachmentPath);
          const base64Content = fileContent.toString('base64');

          parts.push(`--${boundary}`);
          parts.push(`Content-Type: application/octet-stream`);
          parts.push(`Content-Disposition: attachment; filename="${fileName}"`);
          parts.push(`Content-Transfer-Encoding: base64`);
          parts.push('');
          parts.push(base64Content);
        } catch (error) {
          console.error(`Failed to attach file ${attachmentPath}:`, error.message);
        }
      }

      parts.push(`--${boundary}--`);

      emailContent = headers.join('\r\n') + '\r\n\r\n' + parts.join('\r\n');
    } else {
      // Simple message without attachments
      headers.push(`MIME-Version: 1.0`);
      headers.push(`Content-Type: ${html ? 'text/html' : 'text/plain'}; charset=utf-8`);
      headers.push(`Content-Transfer-Encoding: base64`);

      const bodyBase64 = Buffer.from(body, 'utf-8').toString('base64');
      emailContent = headers.join('\r\n') + '\r\n\r\n' + bodyBase64;
    }

    // Encode the entire message in base64url
    return Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async getInboxEmails(options = {}) {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const {
        maxResults = 10,
        query = 'in:inbox',
        includeSpamTrash = false,
        format = 'metadata'
      } = options;

      // Get list of messages
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
        includeSpamTrash: includeSpamTrash
      });

      if (!listResponse.data.messages) {
        return [];
      }

      // Get detailed information for each message
      const emails = await Promise.all(
        listResponse.data.messages.map(async (message) => {
          const messageResponse = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: format
          });

          return this.formatEmailData(messageResponse.data);
        })
      );

      return emails;
    } catch (error) {
      throw new Error(`Failed to get inbox emails: ${error.message}`);
    }
  }

  async getEmailById(emailId, format = 'full') {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: format
      });

      return this.formatEmailData(response.data, true);
    } catch (error) {
      throw new Error(`Failed to get email: ${error.message}`);
    }
  }

  async searchEmails(query, maxResults = 10) {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      if (!listResponse.data.messages) {
        return [];
      }

      const emails = await Promise.all(
        listResponse.data.messages.map(async (message) => {
          const messageResponse = await this.gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata'
          });

          return this.formatEmailData(messageResponse.data);
        })
      );

      return emails;
    } catch (error) {
      throw new Error(`Failed to search emails: ${error.message}`);
    }
  }

  async getSentEmails(maxResults = 10) {
    return this.searchEmails('in:sent', maxResults);
  }

  async getDraftEmails(maxResults = 10) {
    if (!this.gmail) {
      throw new Error('Gmail service not initialized');
    }

    try {
      const listResponse = await this.gmail.users.drafts.list({
        userId: 'me',
        maxResults: maxResults
      });

      if (!listResponse.data.drafts) {
        return [];
      }

      const drafts = await Promise.all(
        listResponse.data.drafts.map(async (draft) => {
          const draftResponse = await this.gmail.users.drafts.get({
            userId: 'me',
            id: draft.id
          });

          return {
            id: draft.id,
            message: this.formatEmailData(draftResponse.data.message)
          };
        })
      );

      return drafts;
    } catch (error) {
      throw new Error(`Failed to get draft emails: ${error.message}`);
    }
  }

  formatEmailData(messageData, includeBody = false) {
    const headers = messageData.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    let body = '';
    let attachments = [];

    if (includeBody && messageData.payload) {
      const extractBody = (payload) => {
        if (payload.body && payload.body.data) {
          return Buffer.from(payload.body.data, 'base64').toString('utf-8');
        }
        
        if (payload.parts) {
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' || part.mimeType === 'text/html') {
              if (part.body && part.body.data) {
                return Buffer.from(part.body.data, 'base64').toString('utf-8');
              }
            }
          }
        }
        
        return '';
      };

      body = extractBody(messageData.payload);

      // Extract attachments info
      const extractAttachments = (payload) => {
        if (payload.parts) {
          payload.parts.forEach(part => {
            if (part.filename && part.filename.length > 0) {
              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                size: part.body?.size || 0,
                attachmentId: part.body?.attachmentId
              });
            }
            if (part.parts) {
              extractAttachments(part);
            }
          });
        }
      };

      extractAttachments(messageData.payload);
    }

    return {
      id: messageData.id,
      threadId: messageData.threadId,
      labelIds: messageData.labelIds || [],
      snippet: messageData.snippet || '',
      from: getHeader('from'),
      to: getHeader('to'),
      cc: getHeader('cc'),
      bcc: getHeader('bcc'),
      subject: getHeader('subject'),
      date: getHeader('date'),
      body: body,
      attachments: attachments,
      sizeEstimate: messageData.sizeEstimate,
      internalDate: messageData.internalDate
    };
  }
}
