import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, avatar } = req.body;

  if (!phoneNumber ||!avatar) {
    return res.status(400).json({ error: 'Phone and avatar required' });
  }

  try {
    const users = await kv.get('users') || [];
    const userIndex = users.findIndex(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[userIndex].avatar = avatar;
    await kv.set('users', users);

    return res.status(200).json({ success: true, avatar });

  } catch (err) {
    console.error('Update avatar error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}