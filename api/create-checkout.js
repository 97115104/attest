import Stripe from 'stripe';
import { getRedisClient } from './lib/redis.js';

// California tax rates by county (simplified - using average rates)
const CA_TAX_RATES = {
  // Default California state tax rate
  default: 0.0725,
  // County-specific rates (state + district taxes)
  // These are simplified averages - actual rates may vary by city
  '90': 0.095,    // Los Angeles County
  '91': 0.095,    // Los Angeles County
  '92': 0.0775,   // San Diego County
  '93': 0.0875,   // Santa Barbara/Ventura
  '94': 0.0875,   // San Francisco Bay Area
  '95': 0.0725,   // Sacramento/Central Valley
  '96': 0.0725,   // Sacramento Area
  '97': 0.0775,   // Oregon border area
  '98': 0.0725,   // Northern California
  '99': 0.0725    // Central Valley
};

function getCaliforniaTaxRate(zipCode) {
  if (!zipCode || zipCode.length < 2) return 0;
  
  const prefix = zipCode.substring(0, 2);
  const numPrefix = parseInt(prefix);
  
  // Check if it's a California zip code (90000-96199)
  if (numPrefix >= 90 && numPrefix <= 96) {
    return CA_TAX_RATES[prefix] || CA_TAX_RATES.default;
  }
  
  return 0; // No tax for non-California
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, attestationData, attestationId, zipCode } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set');
      console.error('Environment variables present:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      return res.status(500).json({ error: 'Stripe configuration error' });
    }
    
    // Log key prefix for debugging (safe to log the prefix)
    console.log('Stripe key prefix:', process.env.STRIPE_SECRET_KEY.substring(0, 7));
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const redis = getRedisClient();
    
    // Check if user already has lifetime access
    const existingKey = await redis.get(`api_key:email:${email}`);
    if (existingKey) {
      return res.status(200).json({ 
        alreadyPurchased: true, 
        apiKey: existingKey,
        message: 'You already have lifetime access!' 
      });
    }

    // Calculate tax based on zip code
    const taxRate = getCaliforniaTaxRate(zipCode);
    const subtotal = 2000; // $20.00 in cents
    const taxAmount = Math.round(subtotal * taxRate);
    
    console.log('Creating checkout session for email:', email);
    console.log('Zip code:', zipCode, 'Tax rate:', taxRate, 'Tax amount:', taxAmount / 100);
    
    // Always use the production URL for checkout redirects
    const baseUrl = 'https://attest.97115104.com';
    
    // Build line items
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'attest Lifetime Short URLs',
            description: 'Create unlimited permanent short URLs for your AI attestations',
            images: ['https://attest.97115104.com/assets/logo/circular-2-ai.svg'],
          },
          unit_amount: subtotal,
        },
        quantity: 1,
      }
    ];
    
    // Add tax as a separate line item if applicable
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Sales Tax (CA)',
            description: `California sales tax${zipCode ? ` for ${zipCode}` : ''}`,
          },
          unit_amount: taxAmount,
        },
        quantity: 1,
      });
    }
    
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      invoice_creation: {
        enabled: true,
      },
      line_items: lineItems,
      mode: 'payment',
      return_url: `${baseUrl}/attestation-result.html?payment_complete={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      metadata: {
        email: email,
        attestationId: attestationId || '',
        zipCode: zipCode || '',
        taxRate: taxRate.toString(),
        attestationData: attestationData ? JSON.stringify(attestationData).substring(0, 400) : '' // Stripe has metadata size limits
      },
    });

    res.status(200).json({ 
      clientSecret: session.client_secret,
      checkoutUrl: session.url // Fallback for non-embedded mode
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({ error: 'Stripe authentication failed. Check your API key.' });
    }
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}