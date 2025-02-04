export default function handler(req, res) {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }
  const ADMIN_ADDRESS = '0xDC0662F19579857C2dAFF24540423939862efB98';
  const isAdmin = address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  return res.status(200).json({ isAdmin });
}
