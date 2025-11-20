import { Resend } from 'resend';

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(process.env.RESEND_API_KEY);
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
    const resend = getResendClient();
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
                color: #36454F;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #FAF9F6;
              }
              .header {
                background: linear-gradient(135deg, #D4AF37 0%, #B8962D 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 10px 0 0 0;
                font-size: 24px;
                font-weight: 700;
              }
              .logo {
                font-size: 36px;
                margin-bottom: 5px;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #E8E8E8;
                border-top: none;
              }
              .story-info {
                background: #FAF9F6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #D4AF37;
              }
              .story-info h2 {
                margin-top: 0;
                color: #D4AF37;
                font-size: 18px;
                font-weight: 600;
              }
              .story-info p {
                margin: 8px 0;
                color: #5A6C7D;
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
                border-radius: 12px;
                font-weight: 600;
                font-size: 14px;
              }
              .button-approve {
                background-color: #8FBC8F;
                color: white;
              }
              .button-reject {
                background-color: #FF7F50;
                color: white;
              }
              .button-view {
                background-color: #D4AF37;
                color: white;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #5A6C7D;
                font-size: 12px;
              }
              .footer a {
                color: #D4AF37;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M51-404q-26-43-38.5-86.5T0-576q0-110 77-187t187-77q63 0 119.5 26t96.5 71q40-45 96.5-71T696-840q110 0 187 77t77 187q0 42-12.5 85T909-405q-10-12-22.5-20.5T860-440q20-35 30-69t10-67q0-85-59.5-144.5T696-780q-55 0-108.5 32.5T480-649q-54-66-107.5-98.5T264-780q-85 0-144.5 59.5T60-576q0 33 10 67t30 69q-14 6-26.5 15T51-404ZM0-80v-53q0-39 42-63t108-24q13 0 24 .5t22 2.5q-8 17-12 34.5t-4 37.5v65H0Zm240 0v-65q0-65 66.5-105T480-290q108 0 174 40t66 105v65H240Zm540 0v-65q0-20-3.5-37.5T765-217q11-2 22-2.5t23-.5q67 0 108.5 24t41.5 63v53H780ZM480-230q-80 0-130 24t-50 61v5h360v-6q0-36-49.5-60T480-230Zm-330-20q-29 0-49.5-20.5T80-320q0-29 20.5-49.5T150-390q29 0 49.5 20.5T220-320q0 29-20.5 49.5T150-250Zm660 0q-29 0-49.5-20.5T740-320q0-29 20.5-49.5T810-390q29 0 49.5 20.5T880-320q0 29-20.5 49.5T810-250Zm-330-70q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-440q0 50-34.5 85T480-320Zm0-180q-25 0-42.5 17T420-440q0 25 17.5 42.5T480-380q26 0 43-17.5t17-42.5q0-26-17-43t-43-17Zm0 60Zm0 300Z"/></svg>
              </div>
              <h1>Ava Mae</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">New Story Awaiting Approval</p>
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
    const resend = getResendClient();
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
                color: #36454F;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #FAF9F6;
              }
              .header {
                background: linear-gradient(135deg, #FF7F50 0%, #E6653F 100%);
                color: white;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .header h1 {
                margin: 10px 0 0 0;
                font-size: 24px;
                font-weight: 700;
              }
              .logo {
                font-size: 36px;
                margin-bottom: 5px;
              }
              .content {
                background: #ffffff;
                padding: 30px;
                border: 1px solid #E8E8E8;
                border-top: none;
              }
              .story-info {
                background: #FFF5F5;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #FF7F50;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #5A6C7D;
                font-size: 12px;
              }
              .footer a {
                color: #D4AF37;
                text-decoration: none;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">
                <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#FFFFFF"><path d="M51-404q-26-43-38.5-86.5T0-576q0-110 77-187t187-77q63 0 119.5 26t96.5 71q40-45 96.5-71T696-840q110 0 187 77t77 187q0 42-12.5 85T909-405q-10-12-22.5-20.5T860-440q20-35 30-69t10-67q0-85-59.5-144.5T696-780q-55 0-108.5 32.5T480-649q-54-66-107.5-98.5T264-780q-85 0-144.5 59.5T60-576q0 33 10 67t30 69q-14 6-26.5 15T51-404ZM0-80v-53q0-39 42-63t108-24q13 0 24 .5t22 2.5q-8 17-12 34.5t-4 37.5v65H0Zm240 0v-65q0-65 66.5-105T480-290q108 0 174 40t66 105v65H240Zm540 0v-65q0-20-3.5-37.5T765-217q11-2 22-2.5t23-.5q67 0 108.5 24t41.5 63v53H780ZM480-230q-80 0-130 24t-50 61v5h360v-6q0-36-49.5-60T480-230Zm-330-20q-29 0-49.5-20.5T80-320q0-29 20.5-49.5T150-390q29 0 49.5 20.5T220-320q0 29-20.5 49.5T150-250Zm660 0q-29 0-49.5-20.5T740-320q0-29 20.5-49.5T810-390q29 0 49.5 20.5T880-320q0 29-20.5 49.5T810-250Zm-330-70q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-440q0 50-34.5 85T480-320Zm0-180q-25 0-42.5 17T420-440q0 25 17.5 42.5T480-380q26 0 43-17.5t17-42.5q0-26-17-43t-43-17Zm0 60Zm0 300Z"/></svg>
              </div>
              <h1>Ava Mae</h1>
              <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Story Not Approved</p>
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

