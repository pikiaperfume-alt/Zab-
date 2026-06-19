/**
 * Firebase Cloud Function stub: proxies requests to Gemini so the API key
 * never reaches the browser. Deploy this once you're ready to move off the
 * client-side VITE_GEMINI_API_KEY approach used in src/lib/gemini.js.
 *
 * Setup:
 *   1. firebase init functions   (choose JavaScript, install dependencies)
 *   2. Copy this file's contents into functions/index.js
 *   3. firebase functions:config:set gemini.key="YOUR_GEMINI_API_KEY"
 *      (or use Secret Manager: firebase functions:secrets:set GEMINI_API_KEY)
 *   4. firebase deploy --only functions
 *   5. In src/lib/gemini.js, replace the direct fetch() call with a call to
 *      this function's HTTPS endpoint instead, passing { history, message, context }.
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

const ZAB_SYSTEM_PROMPT = `You are the ZAB AI Wellness Companion — a warm, calm, emotionally intelligent guide.
Keep replies short (2-4 sentences), gentle, and never clinical. Never diagnose. Never claim to be human.
If someone describes a crisis or self-harm, gently encourage them to reach out to a crisis line or trusted person.`;

exports.zabAiChat = onCall({ secrets: [GEMINI_API_KEY] }, async (request) => {
  const { history = [], message, mood } = request.data || {};

  if (!message || typeof message !== 'string') {
    throw new HttpsError('invalid-argument', 'A "message" string is required.');
  }

  const contextLine = mood ? `The user currently says they are feeling: ${mood}.` : '';

  const contents = [
    { role: 'user', parts: [{ text: `${ZAB_SYSTEM_PROMPT}\n${contextLine}` }] },
    { role: 'model', parts: [{ text: "Understood. I'm here, calm and ready to help." }] },
    ...history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    { role: 'user', parts: [{ text: message }] },
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY.value()}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.8, maxOutputTokens: 300 },
    }),
  });

  if (!res.ok) {
    throw new HttpsError('internal', `Gemini request failed with status ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here with you. Tell me more?";
  return { text };
});
