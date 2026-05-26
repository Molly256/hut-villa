import kv from '../_db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminToken = req.headers['x-admin-token'];
  if (adminToken!== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { targetPhone, newPassword } = req.body;
  if (!targetPhone ||!newPassword) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const users = await kv.get('users') || [];
    const userIndex = users.findIndex(u => u.phone === targetPhone || u.phoneNumber === targetPhone);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].password = await bcrypt.hash(newPassword, 10);
    await kv.set('users', users);

    return res.status(200).json({ success: true, message: 'Password updated' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}