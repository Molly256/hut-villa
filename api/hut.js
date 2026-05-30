import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, action, rentalKey } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    // ===== ACTION: COLLECT INCOME =====
    if (action === 'collect') {
      if (!rentalKey) return res.status(400).json({ error: 'rentalKey required' });

      const rentalRaw = await redis.get(rentalKey);
      if (!rentalRaw) return res.status(404).json({ error: 'Rental not found' });
      
      const rental = typeof rentalRaw === 'string' ? JSON.parse(rentalRaw) : rentalRaw;
      const now = Date.now();
      const expiryTime = rental.rented_at + (rental.days * 24 * 60 * 60 * 1000);

      if (now < expiryTime) {
        return res.status(400).json({ error: 'Hut not expired yet' });
      }
      if (rental.collected) {
        return res.status(400).json({ error: 'Income already collected' });
      }

      // Add income to user balance
      const userKey = `user:${phoneNumber}`;
      const type = await redis.type(userKey);
      
      let newBalance;
      if (type === 'hash') {
        const balance = Number(await redis.hget(userKey, 'balance') || 0);
        newBalance = balance + rental.income;
        await redis.hset(userKey, 'balance', String(newBalance));
      } else {
        const raw = await redis.get(userKey);
        const user = typeof raw === 'string' ? JSON.parse(raw) : raw;
        user.balance = Number(user.balance || 0) + rental.income;
        await redis.set(userKey, JSON.stringify(user));
        newBalance = user.balance;
      }

      // Mark as collected
      rental.collected = true;
      rental.collected_at = now;
      await redis.set(rentalKey, JSON.stringify(rental));

      return res.status(200).json({ 
        success: true, 
        message: `${rental.income} UGX collected`,
        newBalance
      });
    }

    // ===== ACTION: GET HUTS - Default =====
    const rawKeys = await redis.get(`rentals:${phoneNumber}`);
    const rentalKeys = typeof rawKeys === 'string' ? JSON.parse(rawKeys) : rawKeys || [];
    
    const active = [];
    const expired = [];
    const now = Date.now();

    for (const key of rentalKeys) {
      const hutRaw = await redis.get(key);
      if (hutRaw) {
        const hut = typeof hutRaw === 'string' ? JSON.parse(hutRaw) : hutRaw;
        
        // Auto calculate expiry date + time
        const expiryTime = hut.rented_at + (hut.days * 24 * 60 * 60 * 1000);
        hut.rental_key = key;
        hut.expiry_at = expiryTime;
        hut.expiry_date = new Date(expiryTime).toLocaleString();
        hut.is_expired = now >= expiryTime;
        hut.days_left = Math.max(0, Math.ceil((expiryTime - now) / (24 * 60 * 60 * 1000)));

        if (hut.collected) {
          expired.push(hut);
        } else {
          active.push(hut);
        }
      }
    }

    return res.status(200).json({ success: true, active, expired });
    
  } catch (err) {
    console.error('Get huts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}