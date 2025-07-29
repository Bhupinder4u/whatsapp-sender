const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const basicAuth = require('basic-auth');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Basic auth middleware
const auth = function (req, res, next) {
  const user = basicAuth(req);
  const username = 'pogoadmin';
  const password = 'StrongPogo@initiate';

  console.log('Auth user env:', username);
  console.log('Auth pass env:', password);

  if (!user || user.name !== username || user.pass !== password) {
    res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send('Authentication required.');
  }
  next();
};

// Templates
const templates = {
  template1: {
    sid: 'HXfdd745d857c424132a907d9ee57d2f46',
    variables: JSON.stringify({ "1": "Order #12345", "2": "John Doe" }),
  },
  template2: {
    sid: 'HXxxxxxxxxxxxxxxxxx2',
    variables: JSON.stringify({ "1": "Tracking #98765" }),
  },
  template3: {
    sid: 'HXxxxxxxxxxxxxxxxxx3',
    variables: JSON.stringify({ "1": "https://feedback.link" }),
  },
};

// Protect the static folder with basic auth
app.use('/', auth, express.static(path.join(__dirname, 'public')));

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.post('/send-message', async (req, res) => {
  const { to, template } = req.body;

  if (!templates[template]) {
    return res.status(400).json({ success: false, error: 'Invalid template selected.' });
  }

  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      contentSid: templates[template].sid,
      contentVariables: templates[template].variables,
    });

    res.status(200).json({ success: true, sid: message.sid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
