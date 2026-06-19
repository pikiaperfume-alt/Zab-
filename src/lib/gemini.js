// Gemini integration for the ZAB AI Wellness Companion.
//
// Calls the Gemini API directly from the client using a public API key.
// For production, proxy this through a Firebase Cloud Function so the key
// is never exposed in the browser bundle — see /functions/geminiChat.js (stub).

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const geminiReady = Boolean(GEMINI_API_KEY);

const ZAB_SYSTEM_PROMPT = `You are the ZAB AI Wellness Companion — a warm, calm, emotionally intelligent guide inside the ZAB app.
ZAB helps people relax, connect, and grow through meditation, sleep, breathing, wellness clubs, and human tutors.

Voice: gentle, brief, encouraging, never clinical, never preachy. Speak like a trusted friend who happens to know a lot about wellbeing.
Keep replies short — 2-4 sentences unless asked for more. Ask at most one gentle follow-up question.
You can suggest in-app actions (a specific meditation length, a breathing exercise, a sleep story, joining a club, or booking a human tutor) but you do not replace licensed professionals.
If someone describes a crisis, self-harm, or being in danger, gently encourage them to reach out to a crisis line or trusted person right away, and keep your tone calm and non-alarming.
Never diagnose. Never claim to be human.`;

/**
 * Send a message to the ZAB AI companion.
 * @param {Array<{role: 'user'|'model', text: string}>} history - prior turns
 * @param {string} userMessage
 * @param {object} context - optional { mood, name } to personalize tone
 */
export async function sendToZabAI(history, userMessage, context = {}) {
  if (!geminiReady) {
    return demoZabReply(userMessage, context);
  }

  const contextLine = context.mood
    ? `The user currently says they are feeling: ${context.mood}.`
    : '';

  const contents = [
    {
      role: 'user',
      parts: [{ text: `${ZAB_SYSTEM_PROMPT}\n${contextLine}` }],
    },
    {
      role: 'model',
      parts: [{ text: "Understood. I'm here, calm and ready to help." }],
    },
    ...history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 300 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini error ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "I'm here with you. Tell me a little more?";
  } catch (err) {
    console.error('[ZAB AI] Gemini request failed:', err);
    return demoZabReply(userMessage, context);
  }
}

// Local fallback so the UI is fully demoable without an API key.
function demoZabReply(userMessage, context) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('stress') || context.mood === 'Stressed') {
    return "That sounds heavy to carry. Want to try a 3-minute breathing exercise together, or would talking it through help more?";
  }
  if (msg.includes('sleep') || msg.includes('tired') || context.mood === 'Sleepy') {
    return "Rest matters. I can queue a Delta sleep soundscape, or a short sleep story — which sounds better tonight?";
  }
  if (msg.includes('motivat') || context.mood === 'Need Motivation') {
    return "Some days the smallest step counts most. What's one small thing that would make today feel like a win?";
  }
  return "I'm listening. Tell me a bit more about how today's been for you.";
}
