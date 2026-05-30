import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, hutId, hutName, rent, days, income } = req.body;
  if (!phoneNumber ||!hutId ||!rent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const userKey = `user:${phoneNumber}`;
    const rawUser = await redis.get(userKey);
    if (!rawUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = typeof rawUser === 'string'? JSON.parse(rawUser) : rawUser;

    // Check balance
    if (Number(user.balance) < Number(rent)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if already rented
    const rentalKey = `rental:${phoneNumber}:${hutId}`;
    const rawRental = await redis.get(rentalKey);
    const existingRental = rawRental? (typeof rawRental === 'string'? JSON.parse(rawRental) : rawRental) : null;
    if (existingRental &&!existingRental.collected) {
      return res.status(400).json({ error: 'Hut already rented' });
    }

    // Deduct rent and save user
    user.balance = Number(user.balance) - Number(rent);
    await redis.set(userKey, JSON.stringify(user));

    // Create rental record
    const rental = {
      id: Date.now().toString(),
      phoneNumber,
      hut_id: hutId,
      hut_name: hutName,
      rent: Number(rent),
      days: Number(days),
      income: Number(income),
      rented_at: Date.now(),
      collected: false
    };
    await redis.set(rentalKey, JSON.stringify(rental));

    // Track rental keys for this user
    const userRentalsKey = `rentals:${phoneNumber}`;
    const rawRentals = await redis.get(userRentalsKey);
    const userRentals = rawRentals? (typeof rawRentals === 'string'? JSON.parse(rawRentals) : rawRentals) : [];
    if (!userRentals.includes(rentalKey)) {
      userRentals.push(rentalKey);
      await redis.set(userRentalsKey, JSON.stringify(userRentals));
    }

    // Keep users array in sync for team lookups
    const rawUsers = await redis.get('users') || '[]';
    const users = typeof rawUsers === 'string'? JSON.parse(rawUsers) : rawUsers;
    const idx = users.findIndex(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);
    if (idx!== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    await redis.set('users', JSON.stringify(users));

    const { password,...safeUser } = user;

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