import { redis } from './redis';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  try {
    const key = `user:${phoneNumber}`;
    const type = await redis.type(key);

    console.log(`Login attempt for ${phoneNumber}, key type: ${type}`);

    let user = null;

    if (type === 'hash') {
      user = await redis.hgetall(key);
      if (!user || Object.keys(user).length === 0) {
        return res.status(401).json({ error: 'Invalid phone or password' });
      }
      // Convert hash strings to proper types
      user.balance = Number(user.balance) || 0;
      user.createdAt = Number(user.createdAt) || Date.now();
      user.hasFirstDeposit = user.hasFirstDeposit === 'true';
    } else if (type === 'string') {
      const raw = await redis.get(key);
      user = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } else {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    const { password: _, ...safeUser } = user;

    console.log('Login success for', phoneNumber, 'Role:', safeUser.role);
    return res.status(200).json({
      success: true,
      user: safeUser
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}