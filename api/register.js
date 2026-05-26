import kv from './_db.js';
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
    const users = await kv.get('users') || [];

    // Check if user exists
    const exists = users.find(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);
    if (exists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Find referrer if invite code exists
    let referrer = null;
    if (inviteCode) {
      referrer = users.find(u => {
        const code = (u.phone || u.phoneNumber)?.replace('+', '').replace(/\D/g, '') || u.id;
        return code === inviteCode;
      });
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
      referredBy: referrer?.phone || null,
      createdAt: Date.now()
    };

    users.push(newUser);
    await kv.set('users', users);

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