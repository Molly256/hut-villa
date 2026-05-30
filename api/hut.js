import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const rawKeys = await redis.get(`rentals:${phoneNumber}`);
    const rentalKeys = typeof rawKeys === 'string' ? JSON.parse(rawKeys) : rawKeys || [];
    const huts = [];

    for (const key of rentalKeys) {
      const hutRaw = await redis.get(key);
      if (hutRaw) {
        const hut = typeof hutRaw === 'string' ? JSON.parse(hutRaw) : hutRaw;
        huts.push(hut);
      }
    }

    return res.status(200).json({ success: true, huts });
  } catch (err) {
    console.error('Get huts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}