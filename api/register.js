import { redis } from './redis';

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, password, inviteCode } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();
    console.log("Register attempt:", cleanPhone);

    const existing = await redis.get(`user:${cleanPhone}`);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    let referrer = null;
    if (inviteCode) {
      console.log("Invite code:", inviteCode);
    }

    const newUser = {
      id: Date.now().toString(),
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      password: password.trim(),
      role: 'user',
      balance: 0,
      nickname: 'User',
      avatar: '',
      bankMethod: '',
      bankNumber: '',
      bankName: '',
      referredBy: referrer?.phoneNumber || null,
      createdAt: Date.now()
    };

    await redis.set(`user:${cleanPhone}`, newUser);
    
    const verify = await redis.get(`user:${cleanPhone}`);
    console.log("Verify save:", verify ? "OK" : "FAILED");

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      user: userSafe
    });
    
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}