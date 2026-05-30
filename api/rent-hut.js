import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, hutId, hutName, rent, days, income } = req.body;

  // Debug what backend receives
  console.log('REQ BODY:', req.body);

  if (!phoneNumber || !hutId || !rent) {
    return res.status(400).json({
      error: 'Missing required fields',
      received: { phoneNumber, hutId, rent }
    });
  }

  try {
    const userKey = `user:${phoneNumber}`;

    // HASH type = use hgetall, not get
    const rawUser = await redis.hgetall(userKey);
    if (!rawUser || Object.keys(rawUser).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fix: Redis HASH stores everything as string, convert numbers
    const user = {
      ...rawUser,
      balance: Number(rawUser.balance || 0),
      rent: rawUser.rent ? Number(rawUser.rent) : undefined,
      days: rawUser.days ? Number(rawUser.days) : undefined,
      income: rawUser.income ? Number(rawUser.income) : undefined
    };

    // Deduct rent - use hset for HASH
    user.balance = user.balance - Number(rent);
    await redis.hset(userKey, 'balance', String(user.balance));

    return res.status(200).json({
      success: true,
      user
    });

  } catch (err) {
    console.error('Rent hut error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}