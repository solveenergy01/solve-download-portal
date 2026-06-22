// In-memory store (resets on cold start — fine for short-lived download sessions)
const jobs = {};

export default function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { job_id } = req.query;

  if (!job_id) {
    return res.status(400).json({ error: 'Missing job_id' });
  }

  // POST — Make.com calls this to register job start or completion
  if (req.method === 'POST') {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.MAKE_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status, download_url, job_name, error_message } = req.body;

    jobs[job_id] = {
      status,           // 'processing' | 'ready' | 'error'
      download_url,     // Google Drive direct download URL
      job_name,         // e.g. "Job Card: Wayne Smith"
      error_message,
      updated_at: new Date().toISOString(),
    };

    return res.status(200).json({ ok: true });
  }

  // GET — polling page calls this to check status
  if (req.method === 'GET') {
    const job = jobs[job_id];

    if (!job) {
      // Not registered yet — Make may not have started yet
      return res.status(200).json({ status: 'pending' });
    }

    return res.status(200).json(job);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
