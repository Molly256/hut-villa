import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const users = await kv.get('users') || [];
    const hutsIncome = await kv.get('hutsIncome') || [];

    // Build maps for fast lookup
    const userMap = new Map();
    users.forEach(u => {
      const phone = u.phone || u.phoneNumber;
      if (phone) userMap.set(phone, u);
    });

    // Level A: direct referrals
    const levelA = users
      .filter(u => u.referredBy === phoneNumber)
      .map(u => ({
        phone: u.phone || u.phoneNumber,
        date: new Date(u.createdAt || u.id).toLocaleDateString()
      }));

    const levelAPhones = new Set(levelA.map(m => m.phone));

    // Level B: referrals of Level A
    const levelB = users
      .filter(u => levelAPhones.has(u.referredBy))
      .map(u => ({
        phone: u.phone || u.phoneNumber,
        date: new Date(u.createdAt || u.id).toLocaleDateString()
      }));

    const levelBPhones = new Set(levelB.map(m => m.phone));

    // Level C: referrals of Level B
    const levelC = users
      .filter(u => levelBPhones.has(u.referredBy))
      .map(u => ({
        phone: u.phone || u.phoneNumber,
        date: new Date(u.createdAt || u.id).toLocaleDateString()
      }));

    // Calculate total commission
    const totalCommission = hutsIncome
      .filter(h => h.phoneNumber === phoneNumber && h.type === 'referral')
      .reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

    return res.status(200).json({
      team: {
        levelA,
        levelB,
        levelC,
        totalCommission
      }
    });

  } catch (err) {
    console.error('Team error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}