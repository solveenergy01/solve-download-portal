import { Readable } from 'node:stream';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const url = req.query.url;
  const filename = req.query.filename;

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

    const safeName = (filename || 'image.heic').replace(/[^\w\s.-]/g, '_');
    let contentType = response.headers.get('content-type') || 'application/octet-stream';
    if (/\.heic$/i.test(safeName) || /\.heic/i.test(parsedUrl.pathname)) {
      contentType = 'image/heic';
    }
    const contentLength = response.headers.get('content-length');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    if (!response.body) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return res.status(200).send(buffer);
    }

    const nodeStream = Readable.fromWeb(response.body);
    await new Promise((resolve, reject) => {
      nodeStream.on('error', reject);
      res.on('error', reject);
      res.on('finish', resolve);
      nodeStream.pipe(res);
    });
  } catch (e) {
    console.error('View proxy error:', e);
    return res.status(500).json({ error: 'Failed to load image' });
  }
}
