import { getRedisClient } from './lib/redis.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Request headers:', req.headers);
  console.log('Request body type:', typeof req.body);
  console.log('Request body:', req.body);

  // Ensure body is parsed
  if (!req.body || typeof req.body === 'string') {
    return res.status(400).json({ error: 'Request body must be JSON' });
  }

  try {
    // Handle both 'url' and 'dataUrl' field names for backwards compatibility
    const { dataUrl, url, apiKey, email } = req.body;
    const actualDataUrl = dataUrl || url;
    
    console.log('Shorten request received:', {
      hasDataUrl: !!actualDataUrl,
      dataUrlLength: actualDataUrl?.length,
      dataUrlPrefix: actualDataUrl?.substring(0, 50),
      hasApiKey: !!apiKey,
      hasEmail: !!email
    });
    
    if (!actualDataUrl) {
      return res.status(400).json({ error: 'Missing dataUrl or url in request body' });
    }
    
    if (!actualDataUrl.startsWith('data:')) {
      return res.status(400).json({ error: 'Invalid data URL format - must start with "data:"' });
    }

    let redis;
    try {
      redis = getRedisClient();
    } catch (error) {
      console.error('Failed to get Redis client:', error);
      return res.status(500).json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // Verify API key or email
    let validUser = null;
    
    try {
      if (apiKey) {
        // Check if API key is valid
        console.log('Checking API key:', apiKey);
        const keyData = await redis.get(`api_key:${apiKey}`);
        console.log('API key data:', keyData ? 'Found' : 'Not found');
        if (keyData) {
          // Upstash Redis returns objects directly, no need to parse
          const data = typeof keyData === 'string' ? JSON.parse(keyData) : keyData;
          validUser = data.email;
          console.log('Valid user from API key:', validUser);
        }
      } else if (email) {
        // Check if email has an API key
        console.log('Checking email:', email);
        const existingKey = await redis.get(`api_key:email:${email}`);
        console.log('Email has API key:', existingKey ? 'Yes' : 'No');
        if (existingKey) {
          validUser = email;
        }
      }
    } catch (error) {
      console.error('Error checking user validation:', error);
      return res.status(500).json({ 
        error: 'Failed to validate user',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    if (!validUser) {
      return res.status(403).json({ 
        error: 'Payment required',
        requiresPayment: true,
        message: 'Please purchase lifetime access to create permanent short URLs'
      });
    }
    
    // Generate a unique short ID
    let shortId;
    let exists = true;
    
    while (exists) {
      shortId = nanoid();
      exists = await redis.exists(`url:${shortId}`);
    }
    
    console.log('Generated short ID:', shortId);
    console.log('Storing for user:', validUser);
    
    // Store the mapping permanently (no expiration)
    await redis.set(`url:${shortId}`, actualDataUrl);
    await redis.set(`url:${shortId}:owner`, validUser);
    
    // Verify storage
    const stored = await redis.get(`url:${shortId}`);
    console.log('Verification - stored:', stored ? 'Success' : 'Failed');
    
    // Always use the production domain for short URLs
    const shortUrl = `https://attest.97115104.com/s/${shortId}`;
    
    res.status(200).json({ shortUrl, shortId });
  } catch (error) {
    console.error('Error shortening URL:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Failed to shorten URL',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}