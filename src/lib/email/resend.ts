import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join } from 'path';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// Simple template replacement function
function renderTemplate(template: string, data: Record<string, string>): string {
  let rendered = template;
  for (const [key, value] of Object.entries(data)) {
    // Handle both {{key}} and conditional blocks
    rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
  }
  
  // Handle conditional blocks like {{#rejectionReason}}...{{/rejectionReason}}
  rendered = rendered.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, key, content) => {
    return data[key] ? content : '';
  });
  
  return rendered;
}

// Read email templates (do this once at module load)
const templatesDir = join(process.cwd(), 'src', 'lib', 'email', 'templates');

function getTemplate(templateName: string): string {
  return readFileSync(join(templatesDir, `${templateName}.html`), 'utf-8');
}

interface StoryApprovalEmailParams {
  storyId: string;
  treeId: string;
  treeName: string;
  storyTitle: string;
  storyAuthor: string;
  recipientEmail: string;
  recipientName: string;
  appUrl: string;
}

export async function sendStoryApprovalNotification(
  params: StoryApprovalEmailParams
): Promise<{ success: boolean; error?: string }> {
  const {
    storyId,
    treeId,
    treeName,
    storyTitle,
    storyAuthor,
    recipientEmail,
    recipientName,
    appUrl,
  } = params;

  const approveUrl = `${appUrl}/api/stories/${storyId}/approve`;
  const rejectUrl = `${appUrl}/api/stories/${storyId}/reject`;
  const viewUrl = `${appUrl}/trees/${treeId}`;

  try {
    const template = getTemplate('story-approval');
    const html = renderTemplate(template, {
      recipientName,
      treeName,
      storyTitle,
      storyAuthor,
      approveUrl,
      rejectUrl,
      viewUrl,
      appUrl,
    });

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Avamae <noreply@notify.avamae.org>',
      to: [recipientEmail],
      subject: `New Story Submitted for ${treeName}`,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('Story approval email sent:', data);
    return { success: true };
  } catch (error) {
    console.error('Failed to send story approval email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface StoryRejectionEmailParams {
  storyTitle: string;
  treeName: string;
  recipientEmail: string;
  recipientName: string;
  rejectionReason?: string;
  appUrl: string;
}

export async function sendStoryRejectionNotification(
  params: StoryRejectionEmailParams
): Promise<{ success: boolean; error?: string }> {
  const {
    storyTitle,
    treeName,
    recipientEmail,
    recipientName,
    rejectionReason,
    appUrl,
  } = params;

  try {
    const template = getTemplate('story-rejection');
    const html = renderTemplate(template, {
      recipientName,
      treeName,
      storyTitle,
      rejectionReason: rejectionReason || '',
      appUrl,
    });

    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Avamae <noreply@notify.avamae.org>',
      to: [recipientEmail],
      subject: `Story Not Approved: ${storyTitle}`,
      html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send story rejection email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
