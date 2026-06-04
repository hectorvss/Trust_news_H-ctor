import { handleToddyGet, handleToddyPost } from './_toddyCore.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleToddyGet(req, res);
  if (req.method === 'POST') return handleToddyPost(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
}
