import { redis } from './redis';
import bcrypt from 'bcryptjs';

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

    // Check existing user - FIX: parse JSON
    const existingStr = await redis.get(`user:${cleanPhone}`);
    if (existingStr) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate invite code from phone: remove leading 0
    const generatedInviteCode = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;

    let referredBy = null;
    
    if (inviteCode) {
      console.log("Invite code:", inviteCode);
      // Find referrer by invite code - add 0 back to match phone format
      const referrerPhone = `0${inviteCode}`;
      const referrerDataStr = await redis.get(`user:${referrerPhone}`);
      
      if (!referrerDataStr) {
        return res.status(400).json({ error: 'Invalid invitation code' });
      }
      
      referredBy = referrerPhone;
      console.log("Found referrer:", referrerPhone);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const newUser = {
      id: Date.now().toString(),
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      password: hashedPassword,
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

    // FIX: Stringify before saving to Redis
    await redis.set(`user:${cleanPhone}`, JSON.stringify(newUser));
    
    // Add user to referrer's team list - FIX: type safety
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
    
    // Verify save - FIX: parse JSON
    const verifyStr = await redis.get(`user:${cleanPhone}`);
    const verify = verifyStr ? JSON.parse(verifyStr) : null;
    console.log("Verify save:", verify ? "OK" : "FAILED");

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      user: userSafe
    });
    
  } catch (err) {
    console.error('Register error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}