export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, filename } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Invalid url protocol' });
  }

  try {
    const response = await fetch(parsedUrl.toString());
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch file' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const safeName = (filename || 'JobCard.pdf').replace(/[^\w\s.-]/g, '_');

    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (e) {
    console.error('Download proxy error:', e);
    return res.status(500).json({ error: 'Download failed' });
  }
}
