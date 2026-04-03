import Stripe from 'stripe';
import { getRedisClient } from './lib/redis.js';
import { sendApiKeyEmail, sendPaymentNotification } from './lib/email.js';
import { customAlphabet } from 'nanoid';

const generateApiKey = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      return res.status(500).json({ error: 'Stripe configuration error' });
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Retrieve the session from Stripe with expanded line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'total_details']
    });
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const email = session.customer_email || session.customer_details?.email;
    if (!email) {
      return res.status(400).json({ error: 'No email found in session' });
    }

    const redis = getRedisClient();
    
    // Check if API key already exists for this email
    let apiKey = await redis.get(`api_key:email:${email}`);
    
    if (!apiKey) {
      // Generate new API key
      apiKey = `ak_${generateApiKey()}`;
      
      // Store the API key mappings (never expire)
      await redis.set(`api_key:email:${email}`, apiKey);
      await redis.set(`api_key:${apiKey}`, JSON.stringify({
        email,
        created: new Date().toISOString(),
        stripeSessionId: sessionId
      }));
    }
    
    // If there was attestation data in the metadata, create the short URL
    let shortUrl = null;
    if (session.metadata?.attestationData) {
      try {
        const attestationData = JSON.parse(session.metadata.attestationData);
        const dataUrl = `data:application/json;base64,${btoa(JSON.stringify(attestationData))}`;
        
        // Generate short ID
        const shortIdGenerator = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);
        let shortId;
        let exists = true;
        
        while (exists) {
          shortId = shortIdGenerator();
          exists = await redis.exists(`url:${shortId}`);
        }
        
        // Store permanently (no expiration)
        await redis.set(`url:${shortId}`, dataUrl);
        await redis.set(`url:${shortId}:owner`, email);
        
        shortUrl = `https://attest.97115104.com/s/${shortId}`;
      } catch (error) {
        console.error('Error creating short URL from attestation data:', error);
      }
    }
    
    // Get payment details for the receipt
    // When using line items for tax, we need to calculate the subtotal differently
    let subtotal = 20.00; // Default price
    let tax = 0;
    
    // Check if we have line items (when tax is added as separate line item)
    if (session.line_items && session.line_items.data) {
      const productItem = session.line_items.data.find(item => 
        item.description?.includes('attest.97115104.com') || 
        item.price?.product?.name?.includes('attest.97115104.com')
      );
      const taxItem = session.line_items.data.find(item => 
        item.description?.includes('Tax') || 
        item.price?.product?.name?.includes('Tax')
      );
      
      if (productItem) {
        subtotal = productItem.amount_total / 100;
      }
      if (taxItem) {
        tax = taxItem.amount_total / 100;
      }
    } else if (session.amount_subtotal) {
      // Fallback to session totals
      subtotal = session.amount_subtotal / 100;
      tax = session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0;
    }
    
    const paymentDetails = {
      amount: subtotal,
      tax: tax,
      invoiceNumber: session.invoice || undefined // Let email.js generate the short invoice number
    };
    
    console.log('Payment details for email:', paymentDetails);
    console.log('Session total_details:', session.total_details);
    
    // Send emails sequentially
    console.log('Attempting to send confirmation email to customer:', email);
    let customerEmailSuccess = false;
    try {
      const emailSent = await sendApiKeyEmail(email, apiKey, paymentDetails);
      if (emailSent) {
        console.log('Customer email sent successfully to:', email);
        customerEmailSuccess = true;
      } else {
        console.log('Customer email sending failed for:', email);
        console.error('Email transporter may not be configured properly');
      }
    } catch (err) {
      console.error('Failed to send customer email:', err);
      console.error('Customer email error details:', err.message);
      console.error('SMTP configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'Set' : 'Missing',
        pass: process.env.SMTP_PASS ? 'Set' : 'Missing'
      });
    }

    // Send notification email to founder only after customer email is complete
    if (customerEmailSuccess) {
      console.log('Sending payment notification to founder');
      try {
        const founderEmailSuccess = await sendPaymentNotification(email, apiKey, session.amount_total / 100);
        if (founderEmailSuccess) {
          console.log('Founder notification sent successfully');
        } else {
          console.log('Founder notification failed');
        }
      } catch (err) {
        console.error('Failed to send founder notification:', err);
      }
    }
    
    // Get attestation ID from session metadata
    const attestationId = session.metadata?.attestationId;
    
    res.status(200).json({ 
      success: true, 
      apiKey,
      email,
      shortUrl,
      attestationId
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}