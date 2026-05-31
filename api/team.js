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
    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();

    // Helper: safe smembers with type check
    async function safeSMembers(key) {
      const keyType = await redis.type(key);
      if (keyType !== 'set') return [];
      return await redis.smembers(key);
    }

    // Helper: safe get + parse user
    async function safeGetUser(phone) {
      const dataStr = await redis.get(`user:${phone}`);
      if (!dataStr) return null;
      try {
        const u = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
        return {
          phone: u.phone || u.phoneNumber,
          createdAt: u.createdAt || Date.now()
        };
      } catch {
        return null;
      }
    }

    // Level A: direct referrals
    const levelAPhones = await safeSMembers(`team:${cleanPhone}`);
    const levelA = await Promise.all(
      levelAPhones.map(async (phone) => {
        const u = await safeGetUser(phone);
        return u ? {
          phone: u.phone,
          date: new Date(u.createdAt).toLocaleDateString()
        } : null;
      })
    ).then(arr => arr.filter(Boolean));

    // Level B: referrals of Level A
    const levelBPhones = [];
    for (const phone of levelAPhones) {
      const sub = await safeSMembers(`team:${phone}`);
      levelBPhones.push(...sub);
    }
    const levelB = await Promise.all(
      [...new Set(levelBPhones)].map(async (phone) => {
        const u = await safeGetUser(phone);
        return u ? {
          phone: u.phone,
          date: new Date(u.createdAt).toLocaleDateString()
        } : null;
      })
    ).then(arr => arr.filter(Boolean));

    // Level C: referrals of Level B
    const levelCPhones = [];
    for (const phone of levelBPhones) {
      const sub = await safeSMembers(`team:${phone}`);
      levelCPhones.push(...sub);
    }
    const levelC = await Promise.all(
      [...new Set(levelCPhones)].map(async (phone) => {
        const u = await safeGetUser(phone);
        return u ? {
          phone: u.phone,
          date: new Date(u.createdAt).toLocaleDateString()
        } : null;
      })
    ).then(arr => arr.filter(Boolean));

    // Calculate total commission - FIX: read from income:${phone} not hutsIncome
    const incomeStr = await redis.get(`income:${cleanPhone}`);
    let income = [];
    try {
      income = incomeStr ? JSON.parse(incomeStr) : [];
    } catch {
      income = [];
    }
    
    const totalCommission = Array.isArray(income) 
      ? income.filter(h => h?.type === 'referral').reduce((sum, h) => sum + (Number(h.amount) || 0), 0)
      : 0;

    return res.status(200).json({
      team: {
        levelA,
        levelB,
        levelC,
        totalCommission
      }
    });

  } catch (err) {
    console.error('Team error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}