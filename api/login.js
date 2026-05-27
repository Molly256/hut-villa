import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return res.status(400).json({ error: 'Phone and password required' });
  }

  try {
    const users = await kv.get('users') || [];

    const user = users.find(u => u.phoneNumber === phoneNumber || u.phone === phoneNumber);

    if (!user) {
      return res.status(401).json({ error: 'Invalid phone or password' });
    }

    // Check password - hash this in production
    if (user.password !== password) {
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
