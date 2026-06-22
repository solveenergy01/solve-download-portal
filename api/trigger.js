export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { job_id } = req.body;

  if (!job_id) {
    return res.status(400).json({ error: 'Missing job_id' });
  }

  const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL || 'https://hook.us1.make.com/d22eeastlys8leoy8l0w5acta38ry2qr';

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id }),
    });
    console.log('Make webhook response:', response.status);
  } catch (e) {
    console.error('Failed to trigger Make webhook:', e);
  }

  return res.status(200).json({ ok: true, job_id });
}
