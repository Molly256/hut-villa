import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, bankMethod, bankNumber, bankName } = req.body;
  if (!phoneNumber ||!bankNumber ||!bankName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const users = await kv.get('users') || [];
    const userIndex = users.findIndex(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update bank info
    users[userIndex].bankMethod = bankMethod || '';
    users[userIndex].bankNumber = bankNumber;
    users[userIndex].bankName = bankName;

    await kv.set('users', users);

    // Remove password before returning
    const { password: _,...safeUser } = users[userIndex];

    return res.status(200).json({
      success: true,
      user: safeUser,
      message: 'Bank info updated'
    });

  } catch (err) {
    console.error('Update bank info error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}