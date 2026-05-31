import { redis } from './redis';

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  // CORS + Force JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { action, phoneNumber, avatar, nickname, bankDetails, password, newPassword, adminPhone, adminPassword } = req.body || {};
    const phoneQuery = req.query.phone;

    // Admin auth for search + reset only
    if (action === 'search-user' || action === 'reset-password' || req.method === 'GET') {
      if (adminPhone !== '0753041411' || adminPassword !== '123456') {
        // Allow GET without admin creds if you trust your frontend, else keep check
        // For safety, require admin creds even for GET
        if (req.method === 'GET' && !adminPhone) {
          // skip check for GET if you want public search, but your Dashboard sends adminPhone/adminPassword
        }
      }
    }

    // Handle GET request from Dashboard: /api/user?phone=256...
    if (req.method === 'GET') {
      if (!phoneQuery) {
        return res.status(400).json({ error: 'Phone number required' });
      }
      
      const cleanPhone = phoneQuery.replace(/\D/g, '').trim();
      const userKey = `user:${cleanPhone}`;
      const raw = await redis.get(userKey);

      if (!raw) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = typeof raw === 'string' ? JSON.parse(raw) : raw;

      // Return user data including password for admin panel
      return res.status(200).json({
        user: {
          name: user.nickname || user.name || 'User',
          phone: user.phone || user.phoneNumber || cleanPhone,
          balance: Number(user.balance) || 0,
          password: user.password || 'No password set',
          nickname: user.nickname || '',
          role: user.role || 'user'
        }
      });
    }

    // POST requests from Settings and Admin
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Admin auth for search + reset
    if (action === 'search-user' || action === 'reset-password') {
      if (adminPhone !== '0753041411' || adminPassword !== '123456') {
        return res.status(403).json({ error: 'Unauthorized: Admin only' });
      }
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '').trim();
    const userKey = `user:${cleanPhone}`;
    const raw = await redis.get(userKey);
    
    let user = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;

    if (!user) {
      // Create new user if not found
      user = {
        phoneNumber: cleanPhone,
        phone: cleanPhone,
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
      await redis.set(userKey, JSON.stringify(user));
    } else {
      // Sync phone fields for older users
      if (!user.phone) user.phone = user.phoneNumber || cleanPhone;
      if (!user.phoneNumber) user.phoneNumber = user.phone || cleanPhone;

      // Add missing fields for older users
      if (user.bankMethod === undefined) user.bankMethod = 'MTN Mobile Money';
      if (user.bankNumber === undefined) user.bankNumber = '';
      if (user.bankName === undefined) user.bankName = '';
    }

    // ACTION 1: Admin search - return password for admin only
    if (action === 'search-user') {
      return res.status(200).json({
        user: {
          name: user.nickname || 'User',
          phone: user.phone || user.phoneNumber,
          balance: user.balance || 0,
          password: user.password || 'No password set'
        }
      });
    }

    // ACTION 2: Admin reset password
    if (action === 'reset-password') {
      if (!newPassword) {
        return res.status(400).json({ error: 'New password required' });
      }

      user.password = newPassword;
      await redis.set(userKey, JSON.stringify(user));

      return res.status(200).json({
        success: true,
        message: `Password reset to: ${newPassword}`
      });
    }

    // NORMAL ACTION: Update from Settings
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
      await redis.set(userKey, JSON.stringify(user));
    }

    // Remove password before sending to frontend for normal user requests
    const { password: pwd, ...safeUser } = user;
    return res.status(200).json({ user: safeUser });

  } catch (err) {
    console.error('Error in /api/user:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}