import { redis } from './_db.js';
import bcrypt from 'bcryptjs';

export const config = {
  api: {
    bodyParser: true,
  },
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, password, inviteCode } = req.body;

  // Validate input
  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    console.log("Register attempt:", phoneNumber);

    // Check if user exists
    const existing = await redis.get(`user:${phoneNumber}`);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Handle invite code if provided
    let referrer = null;
    if (inviteCode) {
      console.log("Invite code:", inviteCode);
      // You can implement referrer lookup here later
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = {
      id: Date.now().toString(),
      phone: phoneNumber,
      phoneNumber: phoneNumber,
      password: hashedPassword,
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

    // Save to Redis
    await redis.set(`user:${phoneNumber}`, newUser);
    
    // Verify it saved
    const verify = await redis.get(`user:${phoneNumber}`);
    console.log("Verify save:", verify ? "OK" : "FAILED");

    // Return user without password
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