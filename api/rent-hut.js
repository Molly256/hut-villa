import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, hutId, hutName, rent, days, income, img } = req.body;

  console.log('REQ BODY:', req.body);

  if (!phoneNumber || !hutId || !rent) {
    return res.status(400).json({
      error: 'Missing required fields',
      received: { phoneNumber, hutId, rent }
    });
  }

  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const userKey = `user:${cleanPhone}`;
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
        rentedHuts: rawUser.rentedHuts ? JSON.parse(rawUser.rentedHuts) : []
      };
    } else if (type === 'string') {
      const raw = await redis.get(userKey);
      user = typeof raw === 'string' ? JSON.parse(raw) : raw;
      user.balance = Number(user.balance || 0);
      user.rentedHuts = user.rentedHuts || [];
    } else {
      return res.status(404).json({ error: 'User not found' });
    }

    const rentAmount = Number(rent);
    if (user.balance < rentAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newBalance = user.balance - rentAmount;

    const rentalKey = `rental:${cleanPhone}:${hutId}`;
    const startTime = new Date().toISOString();
    const rental = {
      id: Date.now().toString(),
      phoneNumber: cleanPhone,
      hut_id: Number(hutId),
      name: hutName,
      rent: rentAmount,
      days: Number(days),
      income: Number(income),
      img: img || `/assets/huts/${hutName.toLowerCase().replace(' ', '-')}.jpg`,
      startTime: startTime,
      rented_at: Date.now(),
      collected: false
    };
    await redis.set(rentalKey, JSON.stringify(rental));

    const userRentalsKey = `rentals:${cleanPhone}`;
    const rawRentals = await redis.get(userRentalsKey);
    const userRentals = rawRentals ? (typeof rawRentals === 'string' ? JSON.parse(rawRentals) : rawRentals) : [];
    if (!userRentals.includes(rentalKey)) {
      userRentals.push(rentalKey);
      await redis.set(userRentalsKey, JSON.stringify(userRentals));
    }

    user.rentedHuts.push(rental);
    user.balance = newBalance;

    if (type === 'hash') {
      await redis.hset(userKey, 'balance', String(newBalance));
      await redis.hset(userKey, 'rentedHuts', JSON.stringify(user.rentedHuts));
    } else {
      await redis.set(userKey, JSON.stringify(user));
    }

    const { password, ...safeUser } = user;

    // FIXED: Save to transaction history so Bill.js VIP Purchase tab shows it
    const historyKey = `history:${cleanPhone}`;
    const historyRaw = await redis.get(historyKey);
    const history = Array.isArray(historyRaw)? historyRaw : (typeof historyRaw === 'string'? JSON.parse(historyRaw) : []);
    
    const newTx = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type: 'vip_rent',
      amount: rentAmount,
      hutId: Number(hutId),
      hutName: hutName,
      status: 'Completed',
      createdAt: new Date().toISOString()
    };
    history.unshift(newTx);
    await redis.set(historyKey, JSON.stringify(history));

    // Keep old income history too for backup
    try {
      const incomeId = `income:${Date.now()}`;
      const incomeData = {
        type: 'hut_rent',
        amount: rentAmount,
        createdAt: new Date().toISOString(),
        hut_name: hutName
      };
      await redis.set(incomeId, JSON.stringify(incomeData));

      const userIncomeKey = `income:${cleanPhone}`;
      const rawIncomes = await redis.get(userIncomeKey);
      const userIncomes = rawIncomes ? (typeof rawIncomes === 'string' ? JSON.parse(rawIncomes) : rawIncomes) : [];
      userIncomes.unshift(incomeId);
      await redis.set(userIncomeKey, JSON.stringify(userIncomes));
    } catch(e) {
      console.log('Income history save failed, rent still succeeded:', e);
    }

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