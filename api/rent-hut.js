import kv from './_db.js';

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
    const user = await kv.get(userKey);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance
    if (user.balance < rent) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if already rented
    const rentalKey = `rental:${phoneNumber}:${hutId}`;
    const existingRental = await kv.get(rentalKey);
    if (existingRental &&!existingRental.collected) {
      return res.status(400).json({ error: 'Hut already rented' });
    }

    // Deduct rent and save user
    user.balance -= rent;
    await kv.set(userKey, user);

    // Create rental record
    const rental = {
      id: Date.now().toString(),
      phoneNumber,
      hut_id: hutId,
      hut_name: hutName,
      rent,
      days,
      income,
      rentedAt: Date.now(),
      collected: false
    };
    await kv.set(rentalKey, rental);

    // Track rental keys for this user
    const userRentalsKey = `rentals:${phoneNumber}`;
    const userRentals = await kv.get(userRentalsKey) || [];
    if (!userRentals.includes(rentalKey)) {
      userRentals.push(rentalKey);
      await kv.set(userRentalsKey, userRentals);
    }

    // Keep users array in sync for team lookups
    const users = await kv.get('users') || [];
    const idx = users.findIndex(u => u.phone === phoneNumber);
    if (idx!== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    await kv.set('users', users);

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