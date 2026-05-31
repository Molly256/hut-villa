import { redis } from './redis';

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { phoneNumber, password } = req.body || {};

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();
    const key = `user:${cleanPhone}`;
    const raw = await redis.get(key);

    console.log(`Login: input="${phoneNumber}" clean="${cleanPhone}" key="${key}"`);

    if (!raw) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Upstash returns string. Parse safely
    const user = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!user || !user.password) {
      console.log('No password field in user');
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Plain text compare
    if (password.trim() !== String(user.password).trim()) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const { password: _, ...safeUser } = {
      phone: cleanPhone,
      phoneNumber: cleanPhone,
      role: user.role || 'user',
      nickname: user.nickname || user.name || '',
      avatar: user.avatar || '',
      balance: Number(user.balance) || 0,
      createdAt: user.createdAt || Date.now(),
      hasFirstDeposit: user.hasFirstDeposit === true || user.hasFirstDeposit === 'true'
    };

    console.log('Login success for', cleanPhone, 'Role:', safeUser.role);
    return res.status(200).json({
      success: true,
      user: safeUser
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}