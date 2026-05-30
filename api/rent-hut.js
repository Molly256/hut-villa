import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, hutId, hutName, rent, days, income } = req.body;

  // Debug what backend receives
  console.log('REQ BODY:', req.body);

  if (!phoneNumber ||!hutId ||!rent) {
    return res.status(400).json({
      error: 'Missing required fields',
      received: { phoneNumber, hutId, rent }
    });
  }

  try {
    const userKey = `user:${phoneNumber}`;

    // HASH type = use hgetall, not get
    const user = await redis.hgetall(userKey);
    if (!user || Object.keys(user).length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Redis HASH stores everything as string
    const balance = Number(user.balance || 0);
    const rentAmount = Number(rent);

    // Check balance
    if (balance < rentAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if already rented
    const rentalKey = `rental:${phoneNumber}:${hutId}`;
    const rawRental = await redis.get(rentalKey);
    const existingRental = rawRental? JSON.parse(rawRental) : null;
    if (existingRental &&!existingRental.collected) {
      return res.status(400).json({ error: 'Hut already rented' });
    }

    // Deduct rent - use hset for HASH
    const newBalance = balance - rentAmount;
    await redis.hset(userKey, 'balance', String(newBalance));

    // Create rental record
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

    // Track rental keys for this user
    const userRentalsKey = `rentals:${phoneNumber}`;
    const rawRentals = await redis.get(userRentalsKey);
    const userRentals = rawRentals? JSON.parse(rawRentals) : [];
    if (!userRentals.includes(rentalKey)) {
      userRentals.push(rentalKey);
      await redis.set(userRentalsKey, JSON.stringify(userRentals));
    }

    // Update users array for admin team lookups
    const rawUsers = await redis.get('users') || '[]';
    const users = typeof rawUsers === 'string'? JSON.parse(rawUsers) : rawUsers;
    const userObj = {...user, balance: newBalance, phone: user.phone || phoneNumber, phoneNumber };
    const idx = users.findIndex(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);
    if (idx!== -1) {
      users[idx] = userObj;
    } else {
      users.push(userObj);
    }
    await redis.set('users', JSON.stringify(users));

    const { password,...safeUser } = userObj;

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