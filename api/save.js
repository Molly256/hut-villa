import { redis } from './redis';

export const config = {
  api: {
    bodyParser: true,
  },
};

const ALLOWED_KEYS = ['inviteStats', 'appSettings', 'announcements'];

export default async function handler(req, res) {
  // CORS headers - fixes NetworkError
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const key = req.method === 'POST' ? req.body.key : req.query.key;

  // Allow user:* keys for profile updates + existing allowed keys
  const isUserKey = typeof key === 'string' && key.startsWith('user:');
  if (!ALLOWED_KEYS.includes(key) && !isUserKey) {
    return res.status(403).json({ error: 'Key not allowed' });
  }

  if (req.method === 'POST') {
    const { value } = req.body;
    
    // Parse JSON if it's a string for user objects
    let dataToSave = value;
    if (typeof value === 'string' && isUserKey) {
      try {
        dataToSave = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }
    }
    
    await redis.set(key, dataToSave);
    return res.json({ ok: true });
  }
  
  if (req.method === 'GET') {
    const value = await redis.get(key);
    return res.json({ value });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}