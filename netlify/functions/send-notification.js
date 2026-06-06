const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { to = [], submission = {} } = body;

  if (!to.length) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent: [] }),
    };
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.error('GMAIL_USER or GMAIL_APP_PASSWORD env vars not set');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sent: [], error: 'Email not configured' }),
    };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const { name = '', email = '', organization = '', event_type = '', message = '' } = submission;

  const lines = [
    'New booking inquiry via jacorywiley.com',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    ...(organization ? [`Organization: ${organization}`] : []),
    `Event type: ${event_type}`,
    '',
    'Message:',
    message,
  ];

  const text = lines.join('\n');
  const html = lines
    .map((l) =>
      l === ''
        ? '<br>'
        : `<p style="margin:0 0 4px;font-family:sans-serif;font-size:14px;color:#222">${l.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
    )
    .join('');

  const sent = [];
  for (const addr of to) {
    try {
      await transporter.sendMail({
        from: `"Jacory Wiley Site" <${user}>`,
        to: addr,
        subject: `Booking inquiry from ${name || email}`,
        text,
        html: `<div>${html}</div>`,
      });
      sent.push(addr);
    } catch (err) {
      console.error(`Failed to send to ${addr}:`, err.message);
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sent }),
  };
};
