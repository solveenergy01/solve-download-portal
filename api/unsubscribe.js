export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, template, template_name } = req.body || {};
  const emailAddress = typeof email === 'string' ? email.trim() : '';
  const templateName = typeof (template_name || template) === 'string'
    ? String(template_name || template).trim()
    : '';

  if (!emailAddress) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const WEBHOOK_URL = process.env.MAKE_UNSUBSCRIBE_WEBHOOK_URL;

  if (!WEBHOOK_URL) {
    console.error('MAKE_UNSUBSCRIBE_WEBHOOK_URL is not configured');
    return res.status(500).json({ error: 'Unsubscribe webhook is not configured' });
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailAddress,
        template: templateName,
        template_name: templateName,
        unsubscribed_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('Make unsubscribe webhook failed:', response.status);
      return res.status(502).json({ error: 'Failed to process unsubscribe' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Unsubscribe webhook error:', e);
    return res.status(500).json({ error: 'Failed to process unsubscribe' });
  }
}
