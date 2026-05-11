function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).send('Method not allowed');
    return;
  }

  const rawBody = await readRequestBody(req);
  const form = new URLSearchParams(rawBody);

  const name = (form.get('name') || '').trim();
  const email = (form.get('email') || '').trim();
  const subject = (form.get('subject') || '').trim();
  const message = (form.get('message') || '').trim();

  if (!name || !email || !subject || !message) {
    res.status(400).send('Please fill in all required fields.');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    res.status(400).send('Please enter a valid email address.');
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    res.status(500).send('Missing RESEND_API_KEY environment variable.');
    return;
  }

  const toEmail = process.env.CONTACT_TO_EMAIL || 'shreeharshjadhav79@gmail.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: email,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <h2>New portfolio message</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong><br>${safeMessage}</p>
      `.trim()
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    res.status(500).send(errorText || 'Failed to send message.');
    return;
  }

  res.status(200).send('OK');
}
