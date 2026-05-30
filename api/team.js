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
    // Level A: direct referrals from team set
    const levelAPhones = await redis.smembers(`team:${phoneNumber}`);
    const levelA = await Promise.all(
      levelAPhones.map(async (phone) => {
        const u = await redis.get(`user:${phone}`);
        return u ? {
          phone: u.phone || u.phoneNumber,
          date: new Date(u.createdAt || u.id).toLocaleDateString()
        } : null;
      })
    ).then(arr => arr.filter(Boolean));

    const levelAPhonesSet = new Set(levelA.map(m => m.phone));

    // Level B: referrals of Level A
    const levelBPhones = [];
    for (const phone of levelAPhones) {
      const sub = await redis.smembers(`team:${phone}`);
      levelBPhones.push(...sub);
    }
    const levelB = await Promise.all(
      [...new Set(levelBPhones)].map(async (phone) => {
        const u = await redis.get(`user:${phone}`);
        return u ? {
          phone: u.phone || u.phoneNumber,
          date: new Date(u.createdAt || u.id).toLocaleDateString()
        } : null;
      })
    ).then(arr => arr.filter(Boolean));

    const levelBPhonesSet = new Set(levelB.map(m => m.phone));

    // Level C: referrals of Level B
    const levelCPhones = [];
    for (const phone of levelBPhones) {
      const sub = await redis.smembers(`team:${phone}`);
      levelCPhones.push(...sub);
    }
    const levelC = await Promise.all(
      [...new Set(levelCPhones)].map(async (phone) => {
        const u = await redis.get(`user:${phone}`);
        return u ? {
          phone: u.phone || u.phoneNumber,
          date: new Date(u.createdAt || u.id).toLocaleDateString()
        } : null;
      })
    ).then(arr => arr.filter(Boolean));

    // Calculate total commission from hutsIncome per-user keys
    const hutsIncome = await redis.get(`hutsIncome:${phoneNumber}`) || [];
    const totalCommission = hutsIncome
      .filter(h => h.type === 'referral')
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