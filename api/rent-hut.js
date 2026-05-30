import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, hutId, hutName, rent, days, income } = req.body;

  if (!phoneNumber || !hutId || !rent) {
    return res.status(400).json({
      error: 'Missing required fields',
      received: { phoneNumber, hutId, rent }
    });
  }

  try {
    const userKey = `user:${phoneNumber}`;
    const type = await redis.type(userKey);

    let user;
    if (type === 'hash') {
      const rawUser = await redis.hgetall(userKey);
      if (!rawUser || Object.keys(rawUser).length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      user = {
        ...rawUser,
        balance: Number(rawUser.balance || 0),
        rent: rawUser.rent ? Number(rawUser.rent) : undefined,
        days: rawUser.days ? Number(rawUser.days) : undefined,
        income: rawUser.income ? Number(rawUser.income) : undefined
      };
    } else if (type === 'string') {
      const raw = await redis.get(userKey);
      user = typeof raw === 'string' ? JSON.parse(raw) : raw;
      user.balance = Number(user.balance || 0);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }

    const rentAmount = Number(rent);
    if (user.balance < rentAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newBalance = user.balance - rentAmount;
    
    if (type === 'hash') {
      await redis.hset(userKey, 'balance', String(newBalance));
    } else {
      user.balance = newBalance;
      await redis.set(userKey, JSON.stringify(user));
    }

    const rentalKey = `rental:${phoneNumber}:${hutId}`;
    const rental = {
      id: Date.now().toString(),
      phoneNumber,
      hut_id: Number(hutId),
      hut_name: hutName,
      rent: rentAmount,
      days: Number(days),
      income: Number(income),
      rented_at: Date.now(),
      collected: false
    };
    await redis.set(rentalKey, JSON.stringify(rental));

    const userRentalsKey = `rentals:${phoneNumber}`;
    const rawRentals = await redis.get(userRentalsKey);
    const userRentals = typeof rawRentals === 'string' ? JSON.parse(rawRentals) : rawRentals || [];
    if (!userRentals.includes(rentalKey)) {
      userRentals.push(rentalKey);
      await redis.set(userRentalsKey, JSON.stringify(userRentals));
    }

    // FIX: Save to income history for Bill page
    const incomeId = `income:${Date.now()}`;
    const incomeData = {
      type: 'hut_rent',
      amount: rentAmount,
      createdAt: new Date().toISOString(),
      hut_name: hutName
    };
    await redis.set(incomeId, JSON.stringify(incomeData));

    const userIncomeKey = `income:${phoneNumber}`;
    const rawIncomes = await redis.get(userIncomeKey);
    const userIncomes = rawIncomes ? (typeof rawIncomes === 'string' ? JSON.parse(rawIncomes) : rawIncomes) : [];
    userIncomes.unshift(incomeId);
    await redis.set(userIncomeKey, JSON.stringify(userIncomes));

    const { password, ...safeUser } = { ...user, balance: newBalance };

    return res.status(200).json({
      success: true,
      user: safeUser,
      message: `${hutName} rented successfully`
    });

  } catch (err) {
    console.error('Rent hut error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}