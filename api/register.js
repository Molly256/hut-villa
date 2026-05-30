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

  try {
    const { phoneNumber, password, inviteCode } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Phone and password required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();
    console.log("Register attempt:", cleanPhone);

    // Check existing user
    const existingData = await redis.get(`user:${cleanPhone}`);
    if (existingData) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate invite code from phone: remove leading 0 only for invite code
    const generatedInviteCode = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;

    let referredBy = null;
    
    if (inviteCode) {
      console.log("Invite code:", inviteCode);
      const referrerPhone = `0${inviteCode}`;
      const referrerData = await redis.get(`user:${referrerPhone}`);
      
      if (!referrerData) {
        return res.status(400).json({ error: 'Invalid invitation code' });
      }
      
      referredBy = referrerPhone;
      console.log("Found referrer:", referrerPhone);
    }

    // Plain password - no bcrypt
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
      inviteCode: generatedInviteCode,
      referredBy: referredBy,
      createdAt: Date.now()
    };

    // Save to Redis
    await redis.set(`user:${cleanPhone}`, JSON.stringify(newUser));
    
    // Add user to referrer's team list
    if (referredBy) {
      const teamKey = `team:${referredBy}`;
      const keyType = await redis.type(teamKey);
      if (keyType !== 'none' && keyType !== 'set') {
        await redis.del(teamKey);
        console.log("Deleted wrong key type:", keyType);
      }
      await redis.sadd(teamKey, cleanPhone);
      console.log("Added to team:", referredBy);
    }
    
    // Verify save - handle both string and object from redis
    const verifyData = await redis.get(`user:${cleanPhone}`);
    let verify = null;
    if (verifyData) {
      verify = typeof verifyData === 'string' ? JSON.parse(verifyData) : verifyData;
    }
    console.log("Verify save:", verify ? "OK" : "FAILED");

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      user: userSafe
    });
    
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}