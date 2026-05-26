import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, avatar, nickname } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number required' });
  }

  try {
    const users = await kv.get('users') || [];
    const userIndex = users.findIndex(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update avatar if provided
    if (avatar!== undefined) {
      // Limit base64 to ~135KB after encoding to keep KV under 25MB limit
      if (typeof avatar === 'string' && avatar.length > 180000) {
        return res.status(400).json({ error: 'Avatar too large. Max 100KB' });
      }
      users[userIndex].avatar = avatar;
    }

    // Update nickname if provided
    if (nickname!== undefined) {
      const cleanNickname = nickname.trim().replace(/\s+/g, ' ').slice(0, 20);
      if (cleanNickname.length >= 2) {
        users[userIndex].nickname = cleanNickname;
      } else {
        return res.status(400).json({ error: 'Nickname must be 2-20 characters' });
      }
    }

    await kv.set('users', users);

    // Return user without password
    const { password,...userSafe } = users[userIndex];
    return res.status(200).json({ success: true, user: userSafe });

  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}