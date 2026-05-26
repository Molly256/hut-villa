import kv from './_db.js';

const KEYS = ['users', 'rentedHuts', 'deposits', 'withdrawals', 'hutsIncome'];

export default async function handler(req, res) {
  // Check admin token for both GET and POST
  const adminToken = req.headers['x-admin-token'];
  if (adminToken!== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // GET all data
    if (req.method === 'GET') {
      const data = await kv.mget(...KEYS);
      return res.status(200).json({
        users: data[0] || [],
        rentedHuts: data[1] || [],
        deposits: data[2] || [],
        withdrawals: data[3] || [],
        hutsIncome: data[4] || []
      });
    }

    // POST to update one array
    if (req.method === 'POST') {
      const { key, value } = req.body;

      if (!KEYS.includes(key)) {
        return res.status(400).json({ error: 'Invalid key' });
      }

      if (!Array.isArray(value)) {
        return res.status(400).json({ error: 'Value must be an array' });
      }

      await kv.set(key, value);
      return res.status(200).json({ ok: true, key });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Admin data error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}