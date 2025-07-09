import { z } from 'zod';

export const EmailValidationSchema = z.object({
  to: z.union([
    z.string().email(),
    z.array(z.string().email())
  ]).describe('Recipient email address(es)'),
  
  subject: z.string()
    .min(1, 'Subject cannot be empty')
    .max(998, 'Subject too long')
    .describe('Email subject line'),
  
  body: z.string()
    .min(1, 'Body cannot be empty')
    .describe('Email body content'),
  
  cc: z.union([
    z.string().email(),
    z.array(z.string().email())
  ]).optional().describe('CC recipient email address(es)'),
  
  bcc: z.union([
    z.string().email(),
    z.array(z.string().email())
  ]).optional().describe('BCC recipient email address(es)'),
  
  html: z.boolean()
    .optional()
    .default(false)
    .describe('Whether the body contains HTML content'),
  
  attachments: z.array(z.string())
    .optional()
    .describe('Array of file paths to attach'),
});

export function validateEmailAddresses(emails) {
  const emailArray = Array.isArray(emails) ? emails : [emails];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  for (const email of emailArray) {
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email address: ${email}`);
    }
  }
  
  return emailArray;
}

export function sanitizeEmailContent(content, isHtml = false) {
  if (!isHtml) {
    // For plain text, just ensure it's properly encoded
    return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  
  // For HTML, basic sanitization (you might want to use a proper HTML sanitizer)
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}
