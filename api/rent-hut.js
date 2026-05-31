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
    const userKey = `user:${phoneNumber}`;
    const type = await redis.type(userKey);

    // Read user whether it's hash or string
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

    // Deduct rent
    const newBalance = user.balance - rentAmount;

    // Create rental record with correct field names for Dashboard.js
    const rentalKey = `rental:${phoneNumber}:${hutId}`;
    const startTime = new Date().toISOString(); // Dashboard expects startTime
    const rental = {
      id: Date.now().toString(),
      phoneNumber,
      hut_id: Number(hutId),
      name: hutName, // Dashboard reads hut.name, not hut_name
      rent: rentAmount,
      days: Number(days),
      income: Number(income),
      img: img || `/assets/huts/${hutName.toLowerCase().replace(' ', '-')}.jpg`, // Save image for Dashboard
      startTime: startTime, // CRITICAL for expiry calc in Dashboard
      rented_at: Date.now(),
      collected: false
    };
    await redis.set(rentalKey, JSON.stringify(rental));

    // Track rental keys for this user
    const userRentalsKey = `rentals:${phoneNumber}`;
    const rawRentals = await redis.get(userRentalsKey);
    const userRentals = rawRentals ? (typeof rawRentals === 'string' ? JSON.parse(rawRentals) : rawRentals) : [];
    if (!userRentals.includes(rentalKey)) {
      userRentals.push(rentalKey);
      await redis.set(userRentalsKey, JSON.stringify(userRentals));
    }

    // Add to user.rentedHuts array so Dashboard shows immediately
    user.rentedHuts.push(rental);
    user.balance = newBalance;

    // Save user based on type
    if (type === 'hash') {
      await redis.hset(userKey, 'balance', String(newBalance));
      await redis.hset(userKey, 'rentedHuts', JSON.stringify(user.rentedHuts));
    } else {
      await redis.set(userKey, JSON.stringify(user));
    }

    const { password, ...safeUser } = user;

    // Save income history for Bill.js VIP Purchase
    try {
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