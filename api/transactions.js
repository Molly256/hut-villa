import { redis } from './redis';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { phoneNumber } = req.query;
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number required' });
      }

      const [depositKeys, withdrawalKeys, incomeKeys] = await Promise.all([
        redis.get(`deposits:${phoneNumber}`) || [],
        redis.get(`withdrawals:${phoneNumber}`) || [],
        redis.get(`income:${phoneNumber}`) || []
      ]);

      const [deposits, withdrawals, incomes] = await Promise.all([
        Promise.all(depositKeys.map(k => redis.get(k))),
        Promise.all(withdrawalKeys.map(k => redis.get(k))),
        Promise.all(incomeKeys.map(k => redis.get(k)))
      ]);

      const userDeposits = deposits
       .filter(Boolean)
       .map(d => ({ type: 'Deposit', amount: d.amount, status: d.status, created_at: d.createdAt }));

      const userWithdrawals = withdrawals
       .filter(Boolean)
       .map(w => ({ type: 'Withdrawal', amount: w.amount, status: w.status, created_at: w.createdAt }));

      const userHutIncome = incomes
       .filter(Boolean)
       .map(h => ({
          type: h.type === 'referral'? 'Referral Bonus' : 'VIP Income',
          amount: h.amount,
          status: 'Completed',
          created_at: h.createdAt
        }));

      const transactions = [...userDeposits,...userWithdrawals,...userHutIncome]
       .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.status(200).json({ transactions });
    }

    if (req.method === 'POST') {
      const { action,...data } = req.body;

      if (action === 'deposit') {
        const { phoneNumber, amount, method, status } = data;
        if (!phoneNumber ||!amount ||!method) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        if (Number(amount) < 10000) {
          return res.status(400).json({ error: 'Minimum deposit is 10,000 UGX' });
        }

        const userKey = `user:${phoneNumber}`;
        const user = await redis.get(userKey);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const depositId = Date.now().toString();
        const depositKey = `deposit:${depositId}`;

        const deposit = {
          id: depositId,
          phoneNumber,
          amount: Number(amount),
          method,
          status: status || 'pending',
          createdAt: new Date().toISOString()
        };

        await redis.set(depositKey, deposit);

        // Track deposit key for user
        const userDepositsKey = `deposits:${phoneNumber}`;
        const userDeposits = await redis.get(userDepositsKey) || [];
        userDeposits.unshift(depositKey);
        await redis.set(userDepositsKey, userDeposits);

        // Credit referrer on first deposit only
        if (!user.hasFirstDeposit) {
          user.hasFirstDeposit = true;
          await redis.set(userKey, user);

          if (user.referredBy) {
            const referrerKey = `user:${user.referredBy}`;
            const referrer = await redis.get(referrerKey);
            if (referrer) {
              let commission = 0;
              if (user.referralLevel === 'A') commission = deposit.amount * 0.10;
              if (user.referralLevel === 'B') commission = deposit.amount * 0.03;
              if (user.referralLevel === 'C') commission = deposit.amount * 0.01;

              if (commission > 0) {
                referrer.balance = (referrer.balance || 0) + commission;
                await redis.set(referrerKey, referrer);

                const incomeId = Date.now().toString() + 'r';
                const incomeKey = `income:${incomeId}`;
                const income = {
                  id: incomeId,
                  phoneNumber: referrer.phone,
                  amount: commission,
                  type: 'referral',
                  from: phoneNumber,
                  level: user.referralLevel,
                  createdAt: new Date().toISOString()
                };
                await redis.set(incomeKey, income);

                const referrerIncomeKey = `income:${referrer.phone}`;
                const referrerIncomes = await redis.get(referrerIncomeKey) || [];
                referrerIncomes.unshift(incomeKey);
                await redis.set(referrerIncomeKey, referrerIncomes);
              }
            }
          }
        }

        // Update users array for team page
        const users = await redis.get('users') || [];
        const idx = users.findIndex(u => u.phone === phoneNumber);
        if (idx!== -1) {
          users[idx] = user;
          await redis.set('users', users);
        }

        return res.status(200).json({ success: true, message: 'Deposit submitted', deposit });
      }

      if (action === 'withdraw') {
        const { phoneNumber, amount, method, accountNumber, accountName } = data;
        if (!phoneNumber ||!amount ||!method ||!accountNumber ||!accountName) {
          return res.status(400).json({ error: 'Missing required fields' });
        }
        if (Number(amount) < 10000) {
          return res.status(400).json({ error: 'Minimum withdraw is 10,000 UGX' });
        }

        const userKey = `user:${phoneNumber}`;
        const user = await redis.get(userKey);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if ((user.balance || 0) < amount) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        // Deduct balance
        user.balance -= amount;
        await redis.set(userKey, user);

        const withdrawalId = Date.now().toString();
        const withdrawalKey = `withdrawal:${withdrawalId}`;

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

        await redis.set(withdrawalKey, withdrawal);

        // Track withdrawal key for user
        const userWithdrawalsKey = `withdrawals:${phoneNumber}`;
        const userWithdrawals = await redis.get(userWithdrawalsKey) || [];
        userWithdrawals.unshift(withdrawalKey);
        await redis.set(userWithdrawalsKey, userWithdrawals);

        // Update users array
        const users = await redis.get('users') || [];
        const idx = users.findIndex(u => u.phone === phoneNumber);
        if (idx!== -1) {
          users[idx] = user;
          await redis.set('users', users);
        }

        return res.status(200).json({ success: true, message: 'Withdraw request submitted', withdrawal, user });
      }

      if (action === 'hut_income') {
        const { phoneNumber, amount } = data;
        if (!phoneNumber ||!amount) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const userKey = `user:${phoneNumber}`;
        const user = await redis.get(userKey);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Credit user balance
        user.balance = (user.balance || 0) + Number(amount);
        await redis.set(userKey, user);

        const incomeId = Date.now().toString();
        const incomeKey = `income:${incomeId}`;
        const income = {
          id: incomeId,
          phoneNumber,
          amount: Number(amount),
          type: 'vip',
          createdAt: new Date().toISOString()
        };
        await redis.set(incomeKey, income);

        // Track income key for user
        const userIncomeKey = `income:${phoneNumber}`;
        const userIncomes = await redis.get(userIncomeKey) || [];
        userIncomes.unshift(incomeKey);
        await redis.set(userIncomeKey, userIncomes);

        // Update users array
        const users = await redis.get('users') || [];
        const idx = users.findIndex(u => u.phone === phoneNumber);
        if (idx!== -1) {
          users[idx] = user;
          await redis.set('users', users);
        }

        return res.status(200).json({ success: true, income, user });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Transaction error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


