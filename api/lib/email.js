import nodemailer from 'nodemailer';

let transporter;

export function getEmailTransporter() {
  if (!transporter) {
    console.log('Creating email transporter...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'Present' : 'Missing');
    console.log('SMTP_PORT:', process.env.SMTP_PORT || '587');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'Present' : 'Missing');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Present' : 'Missing');
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP_USER and SMTP_PASS environment variables are required');
      return null;
    }
    
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  return transporter;
}

export async function sendApiKeyEmail(email, apiKey, paymentDetails = {}) {
  console.log('sendApiKeyEmail called with email:', email);
  const transporter = getEmailTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured, skipping email');
    console.error('Email environment variables check:');
    console.error('SMTP_USER:', process.env.SMTP_USER ? 'Present' : 'Missing');
    console.error('GMAIL_USER:', process.env.GMAIL_USER ? 'Present' : 'Missing');
    console.error('SMTP_PASS:', process.env.SMTP_PASS ? 'Present' : 'Missing');
    console.error('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Present' : 'Missing');
    return false;
  }
  
  const fromName = process.env.EMAIL_NAME || 'attest';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
  
  // Format payment details
  const subtotal = paymentDetails.amount || 20.00;
  const tax = paymentDetails.tax || 0;
  const total = subtotal + tax;
  // Generate shorter invoice number (8 characters)
  const timestamp = Date.now().toString(36).toUpperCase(); // Base36 timestamp
  const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 random chars
  const invoiceNumber = paymentDetails.invoiceNumber || `INV-${timestamp.slice(-5)}${random}`;
  const paymentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: email,
    subject: `attest Receipt - Order ${invoiceNumber}`,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <!-- Header with Logo -->
        <div style="text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb;">
          <img src="https://attest.97115104.com/assets/logo/logo-256.png" alt="attest" width="100" height="100" style="width: 100px; height: 100px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
          <h1 style="margin: 0; color: #111827; font-size: 28px;">Thank you for your purchase!</h1>
        </div>
        
        <!-- Receipt/Invoice Section -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
          <h2 style="margin-top: 0; color: #111827; font-size: 20px; margin-bottom: 20px;">Receipt</h2>
          
          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 0;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Invoice Number</p>
                  <p style="margin: 0; color: #111827; font-weight: 600;">${invoiceNumber}</p>
                </td>
                <td style="padding: 0; text-align: right;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Date</p>
                  <p style="margin: 0; color: #111827; font-weight: 600;">${paymentDate}</p>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #111827;">attest lifetime short URLs</td>
                <td style="padding: 8px 0; text-align: right; color: #111827;">$${subtotal.toFixed(2)}</td>
              </tr>
              ${tax > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Tax (CA)</td>
                <td style="padding: 8px 0; text-align: right; color: #6b7280;">$${tax.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="font-weight: 600; font-size: 18px;">
                <td style="padding: 12px 0; color: #111827; border-top: 2px solid #e5e7eb;">Total</td>
                <td style="padding: 12px 0; text-align: right; color: #111827; border-top: 2px solid #e5e7eb;">$${total.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            <strong>Billed to:</strong> ${email}
          </p>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px; font-style: italic;">
            This charge will appear on your statement as "McBooBoo LLC" (<a href="https://mcbooboo.boo/" style="color: #3b82f6; text-decoration: none;">mcbooboo.boo</a>)
          </p>
        </div>
        
        <!-- API Key Section -->
        <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h2 style="margin-top: 0; color: #065f46; font-size: 20px;">Your API Key</h2>
          <code style="display: block; background: #111827; color: #10b981; padding: 15px; border-radius: 6px; font-size: 14px; word-break: break-all; font-family: monospace;">
            ${apiKey}
          </code>
          <p style="margin-bottom: 0; margin-top: 15px; color: #065f46; font-size: 14px;">
            Keep this key secure. It provides lifetime access to attest's premium features.
          </p>
        </div>
        
        <!-- Quick Start Guide -->
        <div style="background: #f3f4f6; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
          <h3 style="margin-top: 0; color: #111827;">Quick Start Guide</h3>
          <ol style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
            <li>Your API key is automatically saved in your browser</li>
            <li>Create attestations as normal - they'll now generate permanent URLs</li>
            <li>Access from other devices by entering your email</li>
            <li>For API access, include your key in requests</li>
          </ol>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p style="margin-bottom: 10px;">
            <strong>attest</strong> - Attestation Infrastructure for AI Content
          </p>
          <p style="margin-bottom: 20px;">
            <a href="https://attest.97115104.com" style="color: #3b82f6; text-decoration: none;">Website</a> • 
            <a href="https://github.com/97115104/attest" style="color: #3b82f6; text-decoration: none;">GitHub</a> • 
            <a href="mailto:support@attest.97115104.com" style="color: #3b82f6; text-decoration: none;">Support</a>
          </p>
          <p style="color: #9ca3af; font-size: 12px;">
            This is a receipt for your records. No action is required.
          </p>
        </div>
      </div>
    `
  };
  
  try {
    console.log('Attempting to send email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    console.log('API key email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
}

export async function sendPaymentNotification(customerEmail, apiKey, amount) {
  console.log('sendPaymentNotification called for customer:', customerEmail);
  const transporter = getEmailTransporter();
  
  if (!transporter) {
    console.error('Email transporter not configured, skipping founder notification');
    return false;
  }
  
  const fromName = process.env.EMAIL_NAME || 'attest';
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;
  
  const founderEmail = process.env.FOUNDER_EMAIL || 'founder@status.health';
  console.log('Using founder email:', founderEmail);
  
  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: founderEmail,
    subject: 'New attest Payment Received - $' + amount,
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://attest.97115104.com/assets/logo/logo-256.png" alt="attest" width="80" height="80" style="width: 80px; height: 80px;">
          <h1 style="margin: 20px 0; color: #111827;">Payment Received!</h1>
        </div>
        
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #111827;">Payment Details</h2>
          <p><strong>Customer:</strong> ${customerEmail}</p>
          <p><strong>Amount:</strong> $${amount}</p>
          <p><strong>API Key:</strong> <code style="background: #111827; color: #10b981; padding: 2px 4px; border-radius: 2px;">${apiKey}</code></p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p style="color: #4b5563;">The customer now has lifetime access to create permanent short URLs.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
          <p>attest payment notification</p>
        </div>
      </div>
    `
  };
  
  try {
    console.log('Sending founder notification to founder@status.health');
    const info = await transporter.sendMail(mailOptions);
    console.log('Founder notification sent successfully');
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending founder notification:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
}