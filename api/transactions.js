import { redis } from './redis';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { phoneNumber, action } = req.query;

      if (action === 'list-pending-deposits') {
        const keys = await redis.keys('deposit:*');
        const deposits = [];
        
        for (const k of keys) {
          const raw = await redis.get(k);
          if (!raw) continue;
          const d = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (d.status === 'pending') deposits.push(d);
        }
        return res.status(200).json({ deposits });
      }

      if (action === 'list-pending-withdrawals') {
        const keys = await redis.keys('withdrawal:*');
        const withdrawals = [];
        
        for (const k of keys) {
          const raw = await redis.get(k);
          if (!raw) continue;
          const w = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (w.status === 'pending') withdrawals.push(w);
        }
        return res.status(200).json({ withdrawals });
      }

      if (action === 'history') {
        if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

        const [depositKeys, withdrawalKeys, incomeKeys] = await Promise.all([
          redis.get(`deposits:${phoneNumber}`).then(r => r ? (typeof r === 'string' ? JSON.parse(r) : r) : []),
          redis.get(`withdrawals:${phoneNumber}`).then(r => r ? (typeof r === 'string' ? JSON.parse(r) : r) : []),
          redis.get(`income:${phoneNumber}`).then(r => r ? (typeof r === 'string' ? JSON.parse(r) : r) : [])
        ]);

        const [deposits, withdrawals, incomes] = await Promise.all([
          Promise.all(depositKeys.map(async k => {
            const raw = await redis.get(k);
            return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
          })),
          Promise.all(withdrawalKeys.map(async k => {
            const raw = await redis.get(k);
            return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
          })),
          Promise.all(incomeKeys.map(async k => {
            const raw = await redis.get(k);
            return raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
          }))
        ]);

        const userDeposits = deposits.filter(Boolean).map(d => ({ 
          type: 'Deposit', amount: d.amount, status: d.status, created_at: d.createdAt 
        }));
        const userWithdrawals = withdrawals.filter(Boolean).map(w => ({ 
          type: 'Withdrawal', amount: w.amount, status: w.status, created_at: w.createdAt 
        }));
        const userHutIncome = incomes.filter(Boolean).map(h => ({
          type: h.type === 'referral' ? 'Referral Bonus' : 'VIP Income',
          amount: h.amount, status: 'Completed', created_at: h.createdAt
        }));

        const transactions = [...userDeposits, ...userWithdrawals, ...userHutIncome]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return res.status(200).json({ transactions });
      }

      return res.status(400).json({ error: 'Invalid GET action' });
    }

    if (req.method === 'POST') {
      const { action, ...data } = req.body;

      if (action === 'deposit') {
        const { phoneNumber, amount, method } = data;
        if (!phoneNumber || !amount || !method) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        if (Number(amount) < 10000) {
          return res.status(400).json({ error: 'Minimum deposit is 10,000 UGX' });
        }

        const userKey = `user:${phoneNumber}`;
        const rawUser = await redis.get(userKey);
        const user = rawUser ? (typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser) : null;
        if (!user) return res.status(404).json({ error: 'User not found' });

        const depositId = `deposit:${Date.now()}`;
        const depositKey = `deposit:${phoneNumber}:${depositId}`;

        const deposit = {
          id: depositId,
          phoneNumber,
          amount: Number(amount),
          method,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        await redis.set(depositKey, JSON.stringify(deposit));

        const userDepositsKey = `deposits:${phoneNumber}`;
        const rawDeposits = await redis.get(userDepositsKey);
        const userDeposits = rawDeposits ? (typeof rawDeposits === 'string' ? JSON.parse(rawDeposits) : rawDeposits) : [];
        userDeposits.unshift(depositKey);
        await redis.set(userDepositsKey, JSON.stringify(userDeposits));

        return res.status(200).json({ success: true, message: 'Deposit submitted', deposit });
      }

      if (action === 'confirm-deposit') {
        const { phoneNumber, depositId } = data;
        if (!phoneNumber || !depositId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const depositKey = `deposit:${phoneNumber}:${depositId}`;
        const rawDeposit = await redis.get(depositKey);
        if (!rawDeposit) return res.status(404).json({ error: 'Deposit not found' });

        const deposit = typeof rawDeposit === 'string' ? JSON.parse(rawDeposit) : rawDeposit;
        if (deposit.status !== 'pending') {
          return res.status(400).json({ error: 'Deposit already processed' });
        }

        deposit.status = 'confirmed';
        await redis.set(depositKey, JSON.stringify(deposit));

        const userKey = `user:${phoneNumber}`;
        const rawUser = await redis.get(userKey);
        const user = typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser;
        user.balance = (user.balance || 0) + deposit.amount;
        await redis.set(userKey, JSON.stringify(user));

        return res.status(200).json({ success: true, message: 'Deposit confirmed', balance: user.balance });
      }

      if (action === 'reject-deposit') {
        const { phoneNumber, depositId } = data;
        if (!phoneNumber || !depositId) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const depositKey = `deposit:${phoneNumber}:${depositId}`;
        const rawDeposit = await redis.get(depositKey);
        if (!rawDeposit) return res.status(404).json({ error: 'Deposit not found' });

        const deposit = typeof rawDeposit === 'string' ? JSON.parse(rawDeposit) : rawDeposit;
        if (deposit.status !== 'pending') {
          return res.status(400).json({ error: 'Deposit already processed' });
        }

        deposit.status = 'rejected';
        await redis.set(depositKey, JSON.stringify(deposit));

        return res.status(200).json({ success: true, message: 'Deposit rejected' });
      }

      if (action === 'withdraw') {
        const { phoneNumber, amount, method, accountNumber, accountName } = data;
        if (!phoneNumber || !amount || !method || !accountNumber || !accountName) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        if (Number(amount) < 10000) {
          return res.status(400).json({ error: 'Minimum withdraw is 10,000 UGX' });
        }

        const userKey = `user:${phoneNumber}`;
        const rawUser = await redis.get(userKey);
        const user = rawUser ? (typeof rawUser === 'string' ? JSON.parse(rawUser) : rawUser) : null;
        if (!user) return res.status(404).json({ error: 'User not found' });
        if ((user.balance || 0) < amount) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        user.balance -= amount;
        await redis.set(userKey, JSON.stringify(user));

        const withdrawalId = `withdrawal:${Date.now()}`;
        const withdrawalKey = `withdrawal:${phoneNumber}:${withdrawalId}`;

        const withdrawal = {
          id: withdrawalId,
          phoneNumber,
          amount: Number(amount),
          method,
          accountNumber,
          accountName,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        await redis.set(withdrawalKey, JSON.stringify(withdrawal));

        const userWithdrawalsKey = `withdrawals:${phoneNumber}`;
        const rawWithdrawals = await redis.get(userWithdrawalsKey);
        const userWithdrawals = rawWithdrawals ? (typeof rawWithdrawals === 'string' ? JSON.parse(rawWithdrawals) : rawWithdrawals) : [];
        userWithdrawals.unshift(withdrawalKey);
        await redis.set(userWithdrawalsKey, JSON.stringify(userWithdrawals));

        return res.status(200).json({ success: true, message: 'Withdraw request submitted', withdrawal, user });
      }

      return res.status(400).json({ error: 'Invalid POST action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Transaction error:', err);
    console.error('Stack:', err.stack);
    return res.status(500).json({ error: 'Server error', detail: err.message });
  }
}