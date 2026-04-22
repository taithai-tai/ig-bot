const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

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
