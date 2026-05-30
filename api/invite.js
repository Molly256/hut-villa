import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();

    // Get existing stats, parse JSON
    const statsStr = await redis.get('inviteStats');
    const inviteStats = statsStr? JSON.parse(statsStr) : {};

    // Increment count
    inviteStats[cleanPhone] = (inviteStats[cleanPhone] || 0) + 1;

    // Save back as JSON string
    await redis.set('inviteStats', JSON.stringify(inviteStats));

    return res.status(200).json({ success: true, clicks: inviteStats[cleanPhone] });
  } catch (err) {
    console.error('Invite track error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}