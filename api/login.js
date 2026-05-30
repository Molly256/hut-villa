import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Missing phoneNumber or password' });
  }

  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const key = `user:${cleanPhone}`;
    
    const user = await redis.hgetall(key);
    
    if (!user || Object.keys(user).length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // FIX 1: Redis hash might store as 'phone' or 'phoneNumber'
    const actualPhone = user.phoneNumber || user.phone || cleanPhone;
    
    // FIX 2: Always return both fields so frontend gets phone
    const safeUser = {
      phone: actualPhone,
      phoneNumber: actualPhone,
      balance: Number(user.balance) || 0,
      role: user.role || 'user',
      createdAt: user.createdAt || Date.now()
    };

    return res.status(200).json({ 
      success: true, 
      user: safeUser 
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}