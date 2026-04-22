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
  if (!APP_ID) return res.status(500).send('Missing META_APP_ID in server env');

  const scopes = ['instagram_basic', 'instagram_manage_messages', 'pages_show_list', 'pages_messaging'].join(',');
  const url = new URL('https://www.facebook.com/v22.0/dialog/oauth');
  url.searchParams.set('client_id', APP_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes);
  return res.redirect(url.toString());
});

app.get('/auth/instagram/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');
  if (!APP_ID || !APP_SECRET) return res.status(500).send('Missing META_APP_ID or META_APP_SECRET');

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

    return res.send(`<!doctype html><html><body>
      <script>
        localStorage.setItem('ig_access_token', ${JSON.stringify(accessToken)});
        localStorage.setItem('ig_connect_status', 'ok');
        const returnTo = localStorage.getItem('ig_return_to') || '/';
        window.location.href = returnTo;
      </script>
      เชื่อมต่อสำเร็จ กำลังกลับหน้าแอป...
    </body></html>`);
  } catch (error) {
    return res.status(500).send(`OAuth error: ${error.message}`);
  }
});

app.post('/api/resolve-ig-user', async (req, res) => {
  const { accessToken } = req.body || {};
  if (!accessToken) return res.status(400).json({ error: 'missing accessToken' });

  try {
    const meUrl = new URL('https://graph.facebook.com/v22.0/me/accounts');
    meUrl.searchParams.set('fields', 'instagram_business_account{id,name},name,id');
    meUrl.searchParams.set('access_token', accessToken);

    const pagesRes = await fetch(meUrl);
    const pagesData = await pagesRes.json();

    if (!pagesRes.ok || pagesData.error) {
      return res.status(400).json({ error: pagesData?.error?.message || 'cannot resolve ig user', raw: pagesData });
    }

    const firstPage = pagesData?.data?.find((p) => p.instagram_business_account?.id);
    return res.json({ igUserId: firstPage?.instagram_business_account?.id || '' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/fetch-chat', async (req, res) => {
  const { igUserId, recipientId, accessToken } = req.body || {};
  if (!igUserId || !recipientId || !accessToken) return res.status(400).json({ error: 'missing required fields' });

  try {
    const convUrl = new URL(`https://graph.facebook.com/v22.0/${igUserId}/conversations`);
    convUrl.searchParams.set('platform', 'instagram');
    convUrl.searchParams.set('fields', 'id,updated_time,participants');
    convUrl.searchParams.set('limit', '25');
    convUrl.searchParams.set('access_token', accessToken);

    const convRes = await fetch(convUrl);
    const convData = await convRes.json();

    if (!convRes.ok || convData.error) return res.status(400).json({ error: convData?.error?.message || 'cannot load conversations', raw: convData });

    const conversation = (convData?.data || []).find((c) => (c?.participants?.data || []).some((p) => String(p.id) === String(recipientId)));
    if (!conversation?.id) return res.status(404).json({ error: 'conversation with recipient not found' });

    const msgUrl = new URL(`https://graph.facebook.com/v22.0/${conversation.id}/messages`);
    msgUrl.searchParams.set('fields', 'id,from,to,message,created_time');
    msgUrl.searchParams.set('limit', '50');
    msgUrl.searchParams.set('access_token', accessToken);

    const msgRes = await fetch(msgUrl);
    const msgData = await msgRes.json();
    if (!msgRes.ok || msgData.error) return res.status(400).json({ error: msgData?.error?.message || 'cannot load messages', raw: msgData });

    const messages = (msgData?.data || []).map((m) => {
      const fromId = String(m?.from?.id || '');
      return { id: m.id, text: m.message || '', created_time: m.created_time, from_id: fromId, direction: fromId === String(recipientId) ? 'inbound' : 'outbound' };
    }).sort((a, b) => new Date(b.created_time) - new Date(a.created_time));

    return res.json({ conversationId: conversation.id, messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-dm', async (req, res) => {
  const { igUserId, recipientId, accessToken, message } = req.body || {};
  if (!igUserId || !recipientId || !accessToken || !message) return res.status(400).json({ error: 'missing required fields' });

  try {
    const graphRes = await fetch(`https://graph.facebook.com/v22.0/${igUserId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: recipientId }, messaging_type: 'RESPONSE', message: { text: message }, access_token: accessToken })
    });

    const graphData = await graphRes.json();
    if (!graphRes.ok || graphData.error) return res.status(400).json({ error: graphData?.error?.message || 'graph api error', raw: graphData });
    return res.json({ ok: true, messageId: graphData.message_id, recipientId: graphData.recipient_id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`IG bot web running at http://localhost:${port}`);
});
