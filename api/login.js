import { redis } from './redis';
import bcrypt from 'bcryptjs'; // make sure you have this

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  try {
    // Get user hash
    const user = await redis.hgetall(`user:${phoneNumber}`);

    // hgetall returns {} if key doesn't exist
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Compare with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Remove password before sending to frontend
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      user: safeUser
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}