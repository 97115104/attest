import { getRedisClient } from '../lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing short ID' });
    }

    const redis = getRedisClient();
    const dataUrl = await redis.get(`url:${id}`);
    
    if (!dataUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    // Extract the base64 data from the data URL
    const base64Match = dataUrl.match(/data:application\/json;base64,(.+)/);
    if (!base64Match) {
      return res.status(500).json({ error: 'Invalid stored data URL format' });
    }
    
    // Redirect to the verify page with the data parameter
    const verifyUrl = `https://attest.97115104.com/verify/?data=${base64Match[1]}`;
    res.redirect(302, verifyUrl);
  } catch (error) {
    console.error('Error retrieving URL:', error);
    res.status(500).json({ error: 'Failed to retrieve URL' });
  }
}