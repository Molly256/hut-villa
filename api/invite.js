import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  const inviteStats = await kv.get('inviteStats') || {};
  inviteStats[phoneNumber] = (inviteStats[phoneNumber] || 0) + 1;
  await kv.set('inviteStats', inviteStats);

  return res.status(200).json({ success: true });
}