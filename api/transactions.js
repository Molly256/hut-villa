import { redis } from './redis';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ... all your GET code stays same ...

    if (req.method === 'POST') {
      const { action, adminPhone, adminPassword, ...data } = req.body;

      if (action && (action.includes('confirm') || action.includes('reject') || action === 'reset-password')) {
        if (adminPhone !== '0753041411' || adminPassword !== '123456') {
          return res.status(403).json({ error: 'Unauthorized: Admin only' });
        }
      }

      // ... all your deposit/withdraw code stays same ...

      // FIXED: Reset password action - now updates both places
      if (action === 'reset-password') {
        const { phoneNumber, newPassword } = data;
        if (!phoneNumber || !newPassword) {
          return res.status(400).json({ error: 'Phone number and new password required' });
        }

        // 1. Update user:phone key
        const userKey = `user:${phoneNumber}`;
        const rawUser = await redis.get(userKey);
        if (!rawUser) return res.status(404).json({ error: 'User not found' });
        const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
        user.password = newPassword;
        await redis.set(userKey, JSON.stringify(user));

        // 2. NEW: Also update users array so Search shows new password
        const usersRaw = await redis.get('users');
        const users = typeof usersRaw === 'string' ? JSON.parse(usersRaw) : (usersRaw || []);
        const userIndex = users.findIndex(u => u.phoneNumber === phoneNumber || u.phone === phoneNumber);
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          await redis.set('users', JSON.stringify(users));
        }

        return res.status(200).json({ success: true, message: `Password reset to: ${newPassword}` });
      }

      // FIXED: Correct error messages
      if (action === 'confirm-withdrawal') {
        const { phoneNumber, withdrawalId } = data;
        if (!phoneNumber || !withdrawalId) {
          return res.status(400).json({ error: 'Missing required fields' }); // FIXED
        }
        // ... rest stays same ...
      }

      if (action === 'reject-withdrawal') {
        const { phoneNumber, withdrawalId } = data;
        if (!phoneNumber || !withdrawalId) {
          return res.status(400).json({ error: 'Missing required fields' }); // FIXED
        }
        // ... rest stays same ...
      }

      return res.status(400).json({ error: 'Invalid POST action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Transaction error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}