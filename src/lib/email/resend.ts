import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: 'Avamae <notifications@notify.avamae.org>',
      to: [recipientEmail],
      subject: `New Story Submitted for ${treeName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .story-info {
                background: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .story-info h2 {
                margin-top: 0;
                color: #667eea;
                font-size: 18px;
              }
              .story-info p {
                margin: 8px 0;
                color: #666;
              }
              .button-container {
                text-align: center;
                margin: 30px 0;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                margin: 0 10px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 14px;
              }
              .button-approve {
                background-color: #10b981;
                color: white;
              }
              .button-reject {
                background-color: #ef4444;
                color: white;
              }
              .button-view {
                background-color: #667eea;
                color: white;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #999;
                font-size: 12px;
              }
              .footer a {
                color: #667eea;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>New Story Awaiting Approval</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              
              <p>A new story has been submitted to the memorial tree for <strong>${treeName}</strong>.</p>
              
              <div class="story-info">
                <h2>${storyTitle}</h2>
                <p><strong>Submitted by:</strong> ${storyAuthor}</p>
                <p><strong>Memorial:</strong> ${treeName}</p>
              </div>
              
              <p>As a moderator of this memorial tree, you can review and approve or reject this story.</p>
              
              <div class="button-container">
                <a href="${approveUrl}" class="button button-approve">✓ Approve Story</a>
                <a href="${rejectUrl}" class="button button-reject">✗ Reject Story</a>
              </div>
              
              <div class="button-container">
                <a href="${viewUrl}" class="button button-view">View Memorial Tree</a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you have any questions about this story submission, you can view the full details on the memorial tree page.
              </p>
            </div>
            <div class="footer">
              <p>
                This email was sent by <a href="${appUrl}">Avamae</a><br>
                A platform for sharing memories and celebrating lives
              </p>
            </div>
          </body>
        </html>
      `,
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
    const { data, error } = await resend.emails.send({
      from: 'Avamae <notifications@notify.avamae.org>',
      to: [recipientEmail],
      subject: `Story Not Approved: ${storyTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: #ef4444;
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .story-info {
                background: #fee;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #ef4444;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #999;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Story Not Approved</h1>
            </div>
            <div class="content">
              <p>Hi ${recipientName},</p>
              
              <p>Your story submission for the memorial tree "<strong>${treeName}</strong>" has not been approved by the tree moderator.</p>
              
              <div class="story-info">
                <p><strong>Story Title:</strong> ${storyTitle}</p>
                ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
              </div>
              
              <p>If you have questions about this decision, you may want to reach out to the memorial tree administrator directly.</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Thank you for taking the time to share your memory.
              </p>
            </div>
            <div class="footer">
              <p>
                This email was sent by <a href="${appUrl}">Avamae</a>
              </p>
            </div>
          </body>
        </html>
      `,
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

