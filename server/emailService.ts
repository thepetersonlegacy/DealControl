import { Resend } from 'resend';
import { storage } from './storage';
import type { Purchase, Product } from '@shared/schema';

// Email service using Resend SDK
// Set RESEND_API_KEY environment variable in Railway

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'DealControl <onboarding@resend.dev>';
const SITE_URL = process.env.SITE_URL || 'https://dealcontrol.netlify.app';

// Initialize Resend client
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(data: EmailData): Promise<boolean> {
  if (!resend) {
    console.warn('RESEND_API_KEY not set - email not sent:', data.subject);
    console.log('Would have sent email to:', data.to);
    return false;
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    console.log('Email sent successfully to:', data.to, 'ID:', result?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendPurchaseConfirmationEmail(
  email: string,
  purchase: Purchase,
  product: Product,
  accessToken: string,
  orderBumpProduct?: Product | null
): Promise<boolean> {
  const downloadUrl = `${SITE_URL}/download?token=${accessToken}`;
  const formattedPrice = (purchase.amount / 100).toFixed(2);
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your DealControl Purchase Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Purchase!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none;">
    <h2 style="color: #1e40af; margin-top: 0;">Order Confirmation</h2>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0; color: #334155;">${product.title}</h3>
      <p style="color: #64748b; margin-bottom: 10px;">${product.description?.substring(0, 150)}...</p>
      <p style="font-size: 18px; font-weight: bold; color: #1e40af;">$${formattedPrice}</p>
    </div>
    
    ${orderBumpProduct ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <p style="color: #16a34a; font-weight: bold; margin-top: 0;">+ Bonus Item Included:</p>
      <h4 style="margin: 5px 0; color: #334155;">${orderBumpProduct.title}</h4>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${downloadUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
        Access Your Downloads →
      </a>
    </div>
    
    <p style="color: #64748b; font-size: 14px;">
      <strong>Important:</strong> Save this email! Your download link will work anytime, but you'll need it to access your purchases.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
    
    <p style="color: #64748b; font-size: 12px; text-align: center;">
      © 2026 DealControl, a Peterson Pro Services, LLC Product<br>
      <a href="https://petersonproservices.com/" style="color: #3b82f6;">petersonproservices.com</a>
    </p>
  </div>
</body>
</html>
  `;

  const sent = await sendEmail({
    to: email,
    subject: `Your DealControl Purchase: ${product.title}`,
    html,
  });

  // Log email attempt
  try {
    await storage.createEmailLog({
      userId: purchase.userId || undefined,
      emailType: 'purchase_confirmation',
      status: sent ? 'sent' : 'failed',
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }

  return sent;
}

export async function sendDownloadReminderEmail(
  email: string,
  product: Product,
  accessToken: string
): Promise<boolean> {
  const downloadUrl = `${SITE_URL}/download?token=${accessToken}`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your DealControl Download Link</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
  <h1 style="color: #1e40af;">Your Download is Ready</h1>
  <p>Here's your download link for <strong>${product.title}</strong>:</p>
  <p><a href="${downloadUrl}" style="color: #3b82f6;">${downloadUrl}</a></p>
  <p style="color: #64748b; font-size: 12px;">© 2026 DealControl, a Peterson Pro Services, LLC Product</p>
</body>
</html>
  `;

  return sendEmail({
    to: email,
    subject: `Download Link: ${product.title}`,
    html,
  });
}

