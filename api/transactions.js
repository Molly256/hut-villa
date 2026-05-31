import { redis } from './redis';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET requests for pending lists
    if (req.method === 'GET') {
      const action = req.query.action;
      
      if (action === 'list-pending-deposits') {
        const depositsRaw = await redis.get('pending_deposits');
        const deposits = typeof depositsRaw === 'string' ? JSON.parse(depositsRaw) : (depositsRaw || []);
        return res.status(200).json({ deposits });
      }
      
      if (action === 'list-pending-withdrawals') {
        const withdrawalsRaw = await redis.get('pending_withdrawals');
        const withdrawals = typeof withdrawalsRaw === 'string' ? JSON.parse(withdrawalsRaw) : (withdrawalsRaw || []);
        return res.status(200).json({ withdrawals });
      }
      
      return res.status(400).json({ error: 'Invalid GET action' });
    }

    // POST requests
    if (req.method === 'POST') {
      const { action, adminPhone, adminPassword, ...data } = req.body;

      // Admin auth for confirm/reject/reset
      if (action && (action.includes('confirm') || action.includes('reject') || action === 'reset-password')) {
        if (adminPhone !== '0753041411' || adminPassword !== '123456') {
          return res.status(403).json({ error: 'Unauthorized: Admin only' });
        }
      }

      // NEW: User submits deposit - save as pending for admin approval
      if (action === 'deposit') {
        const { phoneNumber, amount, method } = data;
        
        if (!phoneNumber || !amount || !method) {
          return res.status(400).json({ error: 'Missing fields' });
        }
        
        if (Number(amount) < 10000) {
          return res.status(400).json({ error: 'Minimum deposit is 10,000 UGX' });
        }

        const depositId = Date.now().toString();
        const newDeposit = {
          id: depositId,
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          amount: Number(amount),
          method,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // Load existing pending deposits
        const depositsRaw = await redis.get('pending_deposits');
        const deposits = typeof depositsRaw === 'string' ? JSON.parse(depositsRaw) : (depositsRaw || []);
        
        deposits.unshift(newDeposit); // add to top
        await redis.set('pending_deposits', JSON.stringify(deposits));

        return res.status(200).json({ success: true, message: 'Deposit submitted for review' });
      }

      // FIXED: Reset password action - updates both places
      if (action === 'reset-password') {
        const { phoneNumber, newPassword } = data;
        if (!phoneNumber || !newPassword) {
          return res.status(400).json({ error: 'Phone number and new password required' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '').trim();

        // 1. Update user:phone key
        const userKey = `user:${cleanPhone}`;
        const rawUser = await redis.get(userKey);
        if (!rawUser) return res.status(404).json({ error: 'User not found' });
        const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
        user.password = newPassword;
        await redis.set(userKey, JSON.stringify(user));

        // 2. Also update users array so Search shows new password
        const usersRaw = await redis.get('users');
        const users = typeof usersRaw === 'string' ? JSON.parse(usersRaw) : (usersRaw || []);
        const userIndex = users.findIndex(u => (u.phoneNumber || u.phone) === cleanPhone);
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
          return res.status(400).json({ error: 'Missing required fields' });
        }
        // ... rest of your confirm-withdrawal code stays same ...
      }

      if (action === 'reject-withdrawal') {
        const { phoneNumber, withdrawalId } = data;
        if (!phoneNumber || !withdrawalId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        // ... rest of your reject-withdrawal code stays same ...
      }

      if (action === 'confirm-deposit') {
        const { phoneNumber, depositId } = data;
        if (!phoneNumber || !depositId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        // ... rest of your confirm-deposit code stays same ...
      }

      if (action === 'reject-deposit') {
        const { phoneNumber, depositId } = data;
        if (!phoneNumber || !depositId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        // ... rest of your reject-deposit code stays same ...
      }

      return res.status(400).json({ error: 'Invalid POST action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Transaction error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}