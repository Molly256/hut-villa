import { redis } from './redis';

export const config = { api: { bodyParser: true } };

// Helper to save transaction to user history
async function saveTransaction(phoneNumber, tx) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const historyKey = `history:${cleanPhone}`;
  const historyRaw = await redis.get(historyKey);
  const history = typeof historyRaw === 'string'? JSON.parse(historyRaw) : (historyRaw || []);

  const newTx = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    type: tx.type,
    amount: Number(tx.amount),
    method: tx.method || '',
    status: tx.status || 'Completed',
    createdAt: new Date().toISOString(),
   ...tx
  };

  history.unshift(newTx);
  await redis.set(historyKey, JSON.stringify(history));
  return newTx;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET requests
    if (req.method === 'GET') {
      const action = req.query.action;

      // FIXED: User transaction history for Bill.js
      if (action === 'history') {
        const phoneNumber = req.query.phoneNumber;
        if (!phoneNumber) {
          return res.status(400).json({ error: 'Phone number required' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const historyKey = `history:${cleanPhone}`;
        const historyRaw = await redis.get(historyKey);
        const transactions = typeof historyRaw === 'string'? JSON.parse(historyRaw) : (historyRaw || []);

        return res.status(200).json({ transactions });
      }

      if (action === 'list-pending-deposits') {
        const depositsRaw = await redis.get('pending_deposits');
        const deposits = typeof depositsRaw === 'string'? JSON.parse(depositsRaw) : (depositsRaw || []);
        return res.status(200).json({ deposits });
      }

      if (action === 'list-pending-withdrawals') {
        const withdrawalsRaw = await redis.get('pending_withdrawals');
        const withdrawals = typeof withdrawalsRaw === 'string'? JSON.parse(withdrawalsRaw) : (withdrawalsRaw || []);
        return res.status(200).json({ withdrawals });
      }

      return res.status(400).json({ error: 'Invalid GET action' });
    }

    // POST requests
    if (req.method === 'POST') {
      const { action, adminPhone, adminPassword,...data } = req.body;

      // Admin auth for confirm/reject/reset
      if (action && (action.includes('confirm') || action.includes('reject') || action === 'reset-password')) {
        if (adminPhone!== '0753041411' || adminPassword!== '123456') {
          return res.status(403).json({ error: 'Unauthorized: Admin only' });
        }
      }

      // User submits deposit - save as pending for admin approval
      if (action === 'deposit') {
        const { phoneNumber, amount, method } = data;

        if (!phoneNumber ||!amount ||!method) {
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

        const depositsRaw = await redis.get('pending_deposits');
        const deposits = typeof depositsRaw === 'string'? JSON.parse(depositsRaw) : (depositsRaw || []);

        deposits.unshift(newDeposit);
        await redis.set('pending_deposits', JSON.stringify(deposits));

        return res.status(200).json({ success: true, message: 'Deposit submitted for review' });
      }

      // Reset password action
      if (action === 'reset-password') {
        const { phoneNumber, newPassword } = data;
        if (!phoneNumber ||!newPassword) {
          return res.status(400).json({ error: 'Phone number and new password required' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '').trim();
        const userKey = `user:${cleanPhone}`;
        const rawUser = await redis.get(userKey);
        if (!rawUser) return res.status(404).json({ error: 'User not found' });
        const user = typeof rawUser === 'string'? JSON.parse(rawUser) : rawUser;
        user.password = newPassword;
        await redis.set(userKey, JSON.stringify(user));

        const usersRaw = await redis.get('users');
        const users = typeof usersRaw === 'string'? JSON.parse(usersRaw) : (usersRaw || []);
        const userIndex = users.findIndex(u => (u.phoneNumber || u.phone) === cleanPhone);
        if (userIndex!== -1) {
          users[userIndex].password = newPassword;
          await redis.set('users', JSON.stringify(users));
        }

        return res.status(200).json({ success: true, message: `Password reset to: ${newPassword}` });
      }

      // FIXED: Confirm deposit - adds balance + removes from pending + saves history
      if (action === 'confirm-deposit') {
        const { phoneNumber, depositId } = data;
        if (!phoneNumber ||!depositId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const depositsRaw = await redis.get('pending_deposits');
        const deposits = typeof depositsRaw === 'string'? JSON.parse(depositsRaw) : (depositsRaw || []);

        const depositIndex = deposits.findIndex(d => d.id === depositId && d.phoneNumber === cleanPhone);
        if (depositIndex === -1) {
          return res.status(404).json({ error: 'Deposit not found' });
        }

        const deposit = deposits[depositIndex];
        deposits.splice(depositIndex, 1);
        await redis.set('pending_deposits', JSON.stringify(deposits));

        // Update user balance
        const userKey = `user:${cleanPhone}`;
        const rawUser = await redis.get(userKey);
        if (!rawUser) return res.status(404).json({ error: 'User not found' });

        const user = typeof rawUser === 'string'? JSON.parse(rawUser) : rawUser;
        user.balance = (Number(user.balance) || 0) + Number(deposit.amount);
        await redis.set(userKey, JSON.stringify(user));

        // Update users array for dashboard
        const usersRaw = await redis.get('users');
        const users = typeof usersRaw === 'string'? JSON.parse(usersRaw) : (usersRaw || []);
        const userIndex = users.findIndex(u => (u.phoneNumber || u.phone) === cleanPhone);
        if (userIndex!== -1) {
          users[userIndex].balance = user.balance;
          await redis.set('users', JSON.stringify(users));
        }

        // Save to user history as Deposit
        await saveTransaction(cleanPhone, {
          type: 'deposit',
          amount: deposit.amount,
          method: deposit.method,
          status: 'Completed'
        });

        return res.status(200).json({ success: true, message: 'Deposit confirmed. Balance updated.' });
      }

      // FIXED: Reject deposit - just remove from pending
      if (action === 'reject-deposit') {
        const { phoneNumber, depositId } = data;
        if (!phoneNumber ||!depositId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const depositsRaw = await redis.get('pending_deposits');
        const deposits = typeof depositsRaw === 'string'? JSON.parse(depositsRaw) : (depositsRaw || []);

        const filtered = deposits.filter(d =>!(d.id === depositId && d.phoneNumber === cleanPhone));
        await redis.set('pending_deposits', JSON.stringify(filtered));

        return res.status(200).json({ success: true, message: 'Deposit rejected' });
      }

      // FIXED: Confirm withdrawal - deduct balance + save history
      if (action === 'confirm-withdrawal') {
        const { phoneNumber, withdrawalId } = data;
        if (!phoneNumber ||!withdrawalId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const withdrawalsRaw = await redis.get('pending_withdrawals');
        const withdrawals = typeof withdrawalsRaw === 'string'? JSON.parse(withdrawalsRaw) : (withdrawalsRaw || []);

        const withdrawalIndex = withdrawals.findIndex(w => w.id === withdrawalId && w.phoneNumber === cleanPhone);
        if (withdrawalIndex === -1) {
          return res.status(404).json({ error: 'Withdrawal not found' });
        }

        const withdrawal = withdrawals[withdrawalIndex];
        withdrawals.splice(withdrawalIndex, 1);
        await redis.set('pending_withdrawals', JSON.stringify(withdrawals));

        // Save to user history as Withdrawal
        await saveTransaction(cleanPhone, {
          type: 'withdraw',
          amount: withdrawal.amount,
          method: withdrawal.method,
          status: 'Completed'
        });

        return res.status(200).json({ success: true, message: 'Withdrawal confirmed' });
      }

      // FIXED: Reject withdrawal - refund balance + save history
      if (action === 'reject-withdrawal') {
        const { phoneNumber, withdrawalId } = data;
        if (!phoneNumber ||!withdrawalId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const withdrawalsRaw = await redis.get('pending_withdrawals');
        const withdrawals = typeof withdrawalsRaw === 'string'? JSON.parse(withdrawalsRaw) : (withdrawalsRaw || []);

        const withdrawalIndex = withdrawals.findIndex(w => w.id === withdrawalId && w.phoneNumber === cleanPhone);
        if (withdrawalIndex === -1) {
          return res.status(404).json({ error: 'Withdrawal not found' });
        }

        const withdrawal = withdrawals[withdrawalIndex];
        withdrawals.splice(withdrawalIndex, 1);
        await redis.set('pending_withdrawals', JSON.stringify(withdrawals));

        // Refund balance
        const userKey = `user:${cleanPhone}`;
        const rawUser = await redis.get(userKey);
        if (rawUser) {
          const user = typeof rawUser === 'string'? JSON.parse(rawUser) : rawUser;
          user.balance = (Number(user.balance) || 0) + Number(withdrawal.amount);
          await redis.set(userKey, JSON.stringify(user));
        }

        // Save to user history as rejected
        await saveTransaction(cleanPhone, {
          type: 'withdraw',
          amount: withdrawal.amount,
          method: withdrawal.method,
          status: 'Rejected'
        });

        return res.status(200).json({ success: true, message: 'Withdrawal rejected and refunded' });
      }

      // NEW: Log VIP purchase/rent income
      if (action === 'log-vip') {
        const { phoneNumber, amount, hutId } = data;
        if (!phoneNumber ||!amount) {
          return res.status(400).json({ error: 'Missing fields' });
        }

        await saveTransaction(phoneNumber, {
          type: 'vip_rent',
          amount: amount,
          hutId: hutId || '',
          status: 'Completed'
        });

        return res.status(200).json({ success: true });
      }

      // NEW: Log invitation/referral reward
      if (action === 'log-invitation') {
        const { phoneNumber, amount, invitedPhone } = data;
        if (!phoneNumber ||!amount) {
          return res.status(400).json({ error: 'Missing fields' });
        }

        await saveTransaction(phoneNumber, {
          type: 'referral',
          amount: amount,
          invitedPhone: invitedPhone || '',
          status: 'Completed'
        });

        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid POST action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Transaction error:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}