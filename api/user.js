import { redis } from './redis';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS + Force JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, avatar, nickname, bankDetails, password } = req.body || {};

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // FIX: Upstash returns string. Parse it safely
    const usersRaw = await redis.get('users');
    const users = typeof usersRaw === 'string' ? JSON.parse(usersRaw) : (usersRaw || []);

    // Find user by either phone or phoneNumber field
    let user = users.find(u => u.phoneNumber === phoneNumber || u.phone === phoneNumber);

    if (!user) {
      // Create new user if not found - ALL users get 'user' role
      user = {
        phoneNumber,
        phone: phoneNumber,
        role: 'user',
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
      await redis.set('users', JSON.stringify(users)); // FIX: stringify for Upstash
    } else {
      // Sync phone fields for older users
      if (!user.phone) user.phone = user.phoneNumber;
      if (!user.phoneNumber) user.phoneNumber = user.phone;
      
      // Add missing fields for older users
      if (user.bankMethod === undefined) user.bankMethod = 'MTN Mobile Money';
      if (user.bankNumber === undefined) user.bankNumber = '';
      if (user.bankName === undefined) user.bankName = '';

      // UPDATE fields if provided from Settings
      let updated = false;
      
      if (avatar !== undefined) {
        user.avatar = avatar;
        updated = true;
      }
      if (nickname !== undefined) {
        user.nickname = nickname;
        updated = true;
      }
      if (bankDetails !== undefined) {
        user.bankDetails = bankDetails;
        user.bankMethod = bankDetails.method || user.bankMethod;
        user.bankNumber = bankDetails.accountNumber || user.bankNumber;
        user.bankName = bankDetails.accountName || user.bankName;
        updated = true;
      }
      if (password !== undefined) {
        user.password = password;
        updated = true;
      }

      if (updated) {
        await redis.set('users', JSON.stringify(users)); // FIX: stringify for Upstash
      }
    }

    // Remove password before sending to frontend
    const { password: pwd, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });

  } catch (err) {
    console.error('Error in /api/user:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}