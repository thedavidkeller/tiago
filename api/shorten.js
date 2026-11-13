// Shortens share links via is.gd. Only this app's own URLs are accepted, so the
// endpoint can't be used as an open shortener for arbitrary (e.g. phishing) links.
export default async function handler(req, res) {
    const { url } = req.query;
    if (typeof url !== 'string' || !url || url.length > 100000) {
        return res.status(400).json({ error: 'Missing url param' });
    }

    let parsed;
    try { parsed = new URL(url); } catch { return res.status(400).json({ error: 'Invalid url' }); }
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    if (parsed.protocol !== 'https:' || !host || parsed.host !== host) {
        return res.status(400).json({ error: 'Only links to this app can be shortened' });
    }

    try {
        const r = await fetch('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url));
        const short = (await r.text()).trim();
        if (!/^https:\/\/is\.gd\/[A-Za-z0-9_-]+$/.test(short)) throw new Error('Unexpected response');
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).send(short);
    } catch (e) {
        res.status(502).json({ error: 'Shortener failed' });
    }
}
