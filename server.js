const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const APP_ID = process.env.META_APP_ID || '';
const APP_SECRET = process.env.META_APP_SECRET || '';
const REDIRECT_URI = process.env.META_REDIRECT_URI || `http://localhost:${port}/auth/instagram/callback`;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

app.get('/auth/instagram/start', (req, res) => {
  if (!APP_ID) {
    return res.status(500).send('Missing META_APP_ID in server env');
  }

  const scopes = [
    'instagram_basic',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_messaging'
  ].join(',');

  const url = new URL('https://www.facebook.com/v22.0/dialog/oauth');
  url.searchParams.set('client_id', APP_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes);

  return res.redirect(url.toString());
});

app.get('/auth/instagram/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing code');
  }
  if (!APP_ID || !APP_SECRET) {
    return res.status(500).send('Missing META_APP_ID or META_APP_SECRET');
  }

  try {
    const tokenUrl = new URL('https://graph.facebook.com/v22.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', APP_ID);
    tokenUrl.searchParams.set('client_secret', APP_SECRET);
    tokenUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    tokenUrl.searchParams.set('code', String(code));

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      return res.status(400).send(`Token exchange failed: ${tokenData?.error?.message || 'unknown error'}`);
    }

    const accessToken = tokenData.access_token;

    const meUrl = new URL('https://graph.facebook.com/v22.0/me/accounts');
    meUrl.searchParams.set('access_token', accessToken);

    const pagesRes = await fetch(meUrl);
    const pagesData = await pagesRes.json();

    const firstPage = pagesData?.data?.[0];
    const igUserId = firstPage?.instagram_business_account?.id || '';

    return res.send(`<!doctype html><html><body>
      <script>
        window.opener && window.opener.postMessage({
          type: 'ig_oauth_success',
          accessToken: ${JSON.stringify(accessToken)},
          igUserId: ${JSON.stringify(igUserId)}
        }, window.location.origin);
        window.close();
      </script>
      เชื่อมต่อสำเร็จ คุณสามารถปิดหน้านี้ได้
    </body></html>`);
  } catch (error) {
    return res.status(500).send(`OAuth error: ${error.message}`);
  }
});

app.post('/api/send-dm', async (req, res) => {
  const { igUserId, recipientId, accessToken, message } = req.body || {};
  if (!igUserId || !recipientId || !accessToken || !message) {
    return res.status(400).json({ error: 'missing required fields' });
  }

  try {
    const graphRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
        message: { text: message },
        access_token: accessToken
      })
    });

    const graphData = await graphRes.json();

    if (!graphRes.ok || graphData.error) {
      return res.status(400).json({ error: graphData?.error?.message || 'graph api error', raw: graphData });
    }

    return res.json({ ok: true, messageId: graphData.message_id, recipientId: graphData.recipient_id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`IG bot web running at http://localhost:${port}`);
});
