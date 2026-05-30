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

    // Generate invite code from phone: remove leading 0, must start with 7
    const generatedInviteCode = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;

    let referredBy = null;
    let referrerPhone = null;
    
    if (inviteCode) {
      console.log("Invite code:", inviteCode);
      // Find referrer by invite code - add 0 back to match phone format
      referrerPhone = `0${inviteCode}`;
      const referrerData = await redis.get(`user:${referrerPhone}`);
      
      if (!referrerData) {
        return res.status(400).json({ error: 'Invalid invitation code' });
      }
      
      referredBy = referrerPhone;
      console.log("Found referrer:", referrerPhone);
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
      inviteCode: generatedInviteCode,
      referredBy: referredBy,
      createdAt: Date.now()
    };

    await redis.set(`user:${cleanPhone}`, newUser);
    
    // Add user to referrer's team list - FIX: delete wrong key type first
    if (referredBy) {
      const keyType = await redis.type(`team:${referredBy}`);
      if (keyType !== 'none' && keyType !== 'set') {
        await redis.del(`team:${referredBy}`);
        console.log("Deleted wrong key type:", keyType);
      }
      await redis.sadd(`team:${referredBy}`, cleanPhone);
      console.log("Added to team:", referredBy);
    }
    
    const verify = await redis.get(`user:${cleanPhone}`);
    console.log("Verify save:", verify ? "OK" : "FAILED");

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      user: userSafe
    });
    
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    // Show real error instead of hiding it
    return res.status(500).json({ error: err.message });
  }
}