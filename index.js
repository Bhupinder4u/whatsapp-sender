require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Map your template keys to actual Twilio Template SIDs and variables
const templates = {
  template1: {
    sid: 'HXfdd745d857c424132a907d9ee57d2f46', // Order Confirmation Template SID
    variables: JSON.stringify({ "1": "Order #12345", "2": "John Doe" }),
  },
  template2: {
    sid: 'HXxxxxxxxxxxxxxxxxx2', // Shipping Update Template SID
    variables: JSON.stringify({ "1": "Tracking #98765" }),
  },
  template3: {
    sid: 'HXxxxxxxxxxxxxxxxxx3', // Feedback Request Template SID
    variables: JSON.stringify({ "1": "https://feedback.link" }),
  },
};

app.use(express.static('public'));

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
