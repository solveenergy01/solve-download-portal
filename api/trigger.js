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

  // Fire Make.com webhook (non-blocking — we don't wait for Make to finish)
  try {
    fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id }),
    });
  } catch (e) {
    // Log but don't fail — page will still show polling UI
    console.error('Failed to trigger Make webhook:', e);
  }

  return res.status(200).json({ ok: true, job_id });
}
