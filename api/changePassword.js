import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, oldPassword, newPassword } = req.body;

  if (!phoneNumber ||!oldPassword ||!newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const users = await kv.get('users') || [];
    const userIndex = users.findIndex(u => u.phone === phoneNumber || u.phoneNumber === phoneNumber);

    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check old password
    if (users[userIndex].password!== oldPassword) {
      return res.status(400).json({ error: 'Old password is incorrect' });
    }

    // Update password
    users[userIndex].password = newPassword;

    await kv.set('users', users);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}