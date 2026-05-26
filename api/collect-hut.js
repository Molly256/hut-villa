import kv from './_db.js';

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, hutId } = req.body;
  if (!phoneNumber ||!hutId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Load data from KV
    const users = await kv.get('users') || [];
    const rentedHuts = await kv.get('rentedHuts') || [];

    // Find user
    const userIndex = users.findIndex(u => u.phone === phoneNumber);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the rented hut
    const hutIndex = rentedHuts.findIndex(h =>
      h.phoneNumber === phoneNumber &&
      h.hut_id === hutId &&
     !h.collected
    );

    if (hutIndex === -1) {
      return res.status(404).json({ error: 'Hut not found or already collected' });
    }

    const hut = rentedHuts[hutIndex];

    // Check if matured
    const maturityDate = new Date(new Date(hut.rented_at).getTime() + hut.days * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (now < maturityDate) {
      return res.status(400).json({ error: 'Hut not matured yet' });
    }

    // Mark as collected and add income to balance
    rentedHuts[hutIndex].collected = true;
    users[userIndex].balance += hut.income;

    // Save back to KV
    await kv.set('rentedHuts', rentedHuts);
    await kv.set('users', users);

    return res.status(200).json({
      success: true,
      amount: hut.income,
      user: users[userIndex],
      message: `${hut.income.toLocaleString()} UGX collected`
    });

  } catch (err) {
    console.error('Error collecting hut:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}