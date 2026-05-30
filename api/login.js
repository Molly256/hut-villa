import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' }); // Fixed message
  }

  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  try {
    const key = `user:${phoneNumber.trim()}`;
    const type = await redis.type(key);

    console.log(`Login: input="${phoneNumber}" key="${key}" type=${type}`);

    let user = null;

    if (type === 'hash') {
      user = await redis.hgetall(key);
      if (!user || Object.keys(user).length === 0) {
        console.log('Hash exists but empty');
        return res.status(401).json({ error: 'Invalid phone or password' });
      }
      
      user.balance = Number(user.balance) || 0;
      user.createdAt = Number(user.createdAt) || Date.now();
      user.hasFirstDeposit = user.hasFirstDeposit === 'true';
      
    } else if (type === 'string') {
      const raw = await redis.get(key);
      user = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } else {
      console.log('Key not found. Type:', type);
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    if (!user || !user.password) {
      console.log('No password field in user');
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    if (password.trim() !== String(user.password).trim()) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const { password: _, ...safeUser } = {
      phone: phoneNumber.trim(),
      phoneNumber: phoneNumber.trim(),
      role: user.role || 'user',
      nickname: user.nickname || '',
      avatar: user.avatar || '',
      name: user.name || '',
      balance: Number(user.balance) || 0,
      createdAt: Number(user.createdAt) || Date.now(),
      hasFirstDeposit: user.hasFirstDeposit === true || user.hasFirstDeposit === 'true'
    };

    console.log('Login success for', phoneNumber.trim(), 'Role:', safeUser.role);
    return res.status(200).json({
      success: true,
      user: safeUser
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}