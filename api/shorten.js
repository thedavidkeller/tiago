export default async function handler(req, res) {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'Missing url param' });

    try {
        const r = await fetch('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(url));
        const short = (await r.text()).trim();
        if (!short.startsWith('http')) throw new Error('Unexpected response');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).send(short);
    } catch (e) {
        res.status(502).json({ error: 'Shortener failed' });
    }
}
