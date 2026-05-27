import { kv } from './_db.js';
import bcrypt from 'bcryptjs';

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
    console.log("Register attempt:", phoneNumber);

    // Check if user exists - use individual key
    const existing = await kv.get(`user:${phoneNumber}`);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Find referrer if invite code exists
    let referrer = null;
    if (inviteCode) {
      // Search by scanning users if needed, or store referrer code separately
      // For now, skip this or implement with scan if you have few users
      console.log("Invite code:", inviteCode);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
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

    // Save as individual key - this is the fix
    await kv.set(`user:${phoneNumber}`, newUser);
    
    // Verify it saved
    const verify = await kv.get(`user:${phoneNumber}`);
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