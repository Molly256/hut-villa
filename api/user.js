import { redis } from './redis';

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  // CORS + Force JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { action, phoneNumber, avatar, nickname, bankDetails, password, newPassword, adminPhone, adminPassword } = req.body || {};

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // Admin auth for search + reset only - same as transactions.js
    if (action === 'search-user' || action === 'reset-password') {
      if (adminPhone!== '0753041411' || adminPassword!== '123456') {
        return res.status(403).json({ error: 'Unauthorized: Admin only' });
      }
    }

    // FIX: Upstash returns string. Parse it safely
    const usersRaw = await redis.get('users');
    const users = typeof usersRaw === 'string'? JSON.parse(usersRaw) : (usersRaw || []);

    // Find user by either phone or phoneNumber field
    let userIndex = users.findIndex(u => u.phoneNumber === phoneNumber || u.phone === phoneNumber);
    let user = userIndex!== -1? users[userIndex] : null;

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
      userIndex = users.length - 1;
      await redis.set('users', JSON.stringify(users));
    } else {
      // Sync phone fields for older users
      if (!user.phone) user.phone = user.phoneNumber;
      if (!user.phoneNumber) user.phoneNumber = user.phone;

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
          phone: user.phoneNumber || user.phone,
          balance: user.balance || 0,
          password: user.password || 'No password set' // Show old password to admin
        }
      });
    }

    // ACTION 2: Admin reset password
    if (action === 'reset-password') {
      if (!newPassword) {
        return res.status(400).json({ error: 'New password required' });
      }

      users[userIndex].password = newPassword;
      await redis.set('users', JSON.stringify(users));

      // Also update user:phone key for login
      const userKey = `user:${phoneNumber}`;
      const userRaw = await redis.get(userKey);
      if (userRaw) {
        const userObj = typeof userRaw === 'string'? JSON.parse(userRaw) : userRaw;
        userObj.password = newPassword;
        await redis.set(userKey, JSON.stringify(userObj));
      }

      return res.status(200).json({
        success: true,
        message: `Password reset to: ${newPassword}`
      });
    }

    // NORMAL ACTION: Update from Settings - keep your existing logic
    let updated = false;

    if (avatar!== undefined) {
      user.avatar = avatar;
      updated = true;
    }
    if (nickname!== undefined) {
      user.nickname = nickname;
      updated = true;
    }
    if (bankDetails!== undefined) {
      user.bankDetails = bankDetails;
      user.bankMethod = bankDetails.method || user.bankMethod;
      user.bankNumber = bankDetails.accountNumber || user.bankNumber;
      user.bankName = bankDetails.accountName || user.bankName;
      updated = true;
    }
    if (password!== undefined) {
      user.password = password;
      updated = true;
    }

    if (updated) {
      users[userIndex] = user;
      await redis.set('users', JSON.stringify(users));
    }

    // Remove password before sending to frontend for normal user requests
    const { password: pwd,...safeUser } = user;
    return res.status(200).json({ user: safeUser });

  } catch (err) {
    console.error('Error in /api/user:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}