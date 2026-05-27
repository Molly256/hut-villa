import { redis } from './redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const users = await redis.get('users') || [];

    // Find user by either phone or phoneNumber field
    let user = users.find(u => u.phoneNumber === phoneNumber || u.phone === phoneNumber);

    if (!user) {
      // Create new user if not found
      user = {
        phoneNumber,
        phone: phoneNumber,
        role: phoneNumber === '0753520252' ? 'admin' : 'user',
        balance: 0,
        nickname: 'User',
        avatar: '',
        referredBy: null,
        referralLevel: null,
        hasFirstDeposit: false,
        bankMethod: 'MTN Mobile Money',
        bankNumber: '',
        bankName: '',
        createdAt: new Date().toISOString()
      };

      users.push(user);
      await redis.set('users', users);
    } else {
      // Sync phone fields for older users
      if (!user.phone) user.phone = user.phoneNumber;
      if (!user.phoneNumber) user.phoneNumber = user.phone;
      
      // Add missing fields for older users
      if (user.bankMethod === undefined) user.bankMethod = 'MTN Mobile Money';
      if (user.bankNumber === undefined) user.bankNumber = '';
      if (user.bankName === undefined) user.bankName = '';
      
      await redis.set('users', users);
    }

    // Remove password before sending to frontend
    const { password, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });

  } catch (err) {
    console.error('Error in /api/user:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}


