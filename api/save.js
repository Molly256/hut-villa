import { redis } from './redis';

const ALLOWED_KEYS = ['inviteStats', 'appSettings', 'announcements'];

export default async function handler(req, res) {
  const key = req.method === 'POST' ? req.body.key : req.query.key;

  if (!ALLOWED_KEYS.includes(key)) {
    return res.status(403).json({ error: 'Key not allowed' });
  }

  if (req.method === 'POST') {
    const { value } = req.body;
    await redis.set(key, value);
    return res.json({ ok: true });
  }
  
  if (req.method === 'GET') {
    const value = await redis.get(key);
    return res.json({ value });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}


