// Sends the contact form. Everything about *how* a message leaves the site is in this one function, so it can
// later be swapped for a Next.js route handler (POST to /api/contact) without touching the form.
//
// Today it uses Web3Forms (https://web3forms.com): a free service that emails you whatever is posted to it. The
// access key comes from NEXT_PUBLIC_WEB3FORMS_KEY in .env.local (see .env.example). It's a "public" key by design:
// it can only send to your inbox, so it's safe in the browser. It must be written out in full below
// (process.env.NEXT_PUBLIC_...), because Next.js swaps that exact text for the value when it builds the site.

export type ContactMessage = {
  name: string;
  email: string;
  topic: string;
  message: string;
  // Honeypot: a field hidden from people. Bots fill every field they find, so a value here means "bot"
  botcheck: string;
};

export async function sendContactMessage(data: ContactMessage): Promise<{ ok: boolean }> {
  const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!accessKey) {
    console.warn('Contact form: NEXT_PUBLIC_WEB3FORMS_KEY is not set (.env.local), so the message was not sent.');
    return { ok: false };
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `Portfolio: ${data.name} wrote about ${data.topic}`,
        from_name: 'Portfolio contact form',
        name: data.name,
        email: data.email,
        topic: data.topic,
        message: data.message,
        botcheck: data.botcheck,
      }),
    });
    const result = (await response.json()) as { success?: boolean };
    return { ok: response.ok && result.success === true };
  } catch {
    // Offline, blocked, or the service is down
    return { ok: false };
  }
}
