import { genkit } from 'genkit';
import { googleAI, gemini as geminiModel } from '@genkit-ai/googleai';
import openAI from '@genkit-ai/compat-oai/openai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL;
const ZAB_AI_PROVIDER = import.meta.env.VITE_ZAB_AI_PROVIDER || 'auto';

const GEMINI_MODEL = 'gemini-2.5-flash';
const OPENAI_MODEL_NAME = 'gpt-3.5-turbo';

const geminiPlugin = GEMINI_API_KEY
  ? googleAI({ apiKey: GEMINI_API_KEY, apiVersion: 'v1beta' })
  : null;
const openAIPlugin = OPENAI_API_KEY
  ? openAI({ apiKey: OPENAI_API_KEY, baseURL: OPENAI_BASE_URL })
  : null;

const ai = genkit({
  plugins: [geminiPlugin, openAIPlugin].filter(Boolean),
});

export const zabAIReady = Boolean(GEMINI_API_KEY || OPENAI_API_KEY);
export const availableZabAIProviders = [
  ...(OPENAI_API_KEY ? ['openai'] : []),
  ...(GEMINI_API_KEY ? ['gemini'] : []),
];
export const zabAIProviderLabels = {
  auto: 'Auto',
  openai: 'OpenAI-compatible',
  gemini: 'Gemini',
};
export const initialZabAIProvider =
  availableZabAIProviders[0] ?? 'auto';

const ZAB_SYSTEM_PROMPT = `You are the ZAB AI Wellness Companion — a warm, calm, emotionally intelligent guide inside the ZAB app.
ZAB helps people relax, connect, and grow through meditation, sleep, breathing, wellness clubs, and human tutors.

Voice: gentle, brief, encouraging, never clinical, never preachy. Speak like a trusted friend who happens to know a lot about wellbeing.
Keep replies short — 2-4 sentences unless asked for more. Ask at most one gentle follow-up question.
You can suggest in-app actions (a specific meditation length, a breathing exercise, a sleep story, joining a club, or booking a human tutor) but you do not replace licensed professionals.
If someone describes a crisis, self-harm, or being in danger, gently encourage them to reach out to a crisis line or trusted person right away, and keep your tone calm and non-alarming.
Never diagnose. Never claim to be human.`;

function chooseProvider(requestedProvider = 'auto') {
  const normalized = String(requestedProvider).toLowerCase();
  if (normalized === 'openai' && OPENAI_API_KEY) return 'openai';
  if (normalized === 'gemini' && GEMINI_API_KEY) return 'gemini';
  if (normalized === 'auto') {
    return OPENAI_API_KEY ? 'openai' : GEMINI_API_KEY ? 'gemini' : 'none';
  }
  return OPENAI_API_KEY ? 'openai' : GEMINI_API_KEY ? 'gemini' : 'none';
}

function chooseModel(provider) {
  if (provider === 'openai') {
    return openAI.model(OPENAI_MODEL_NAME);
  }
  if (provider === 'gemini') {
    return geminiModel(GEMINI_MODEL);
  }
  return undefined;
}

/**
 * Send a message to the ZAB AI companion.
 * @param {Array<{role: 'user'|'model', text: string}>} history - prior turns
 * @param {string} userMessage
 * @param {object} context - optional { mood, provider } to personalize tone
 */
export async function sendToZabAI(history, userMessage, context = {}) {
  if (!zabAIReady) {
    return demoZabReply(userMessage, context);
  }

  const provider = chooseProvider(context.provider ?? ZAB_AI_PROVIDER);
  const model = chooseModel(provider);
  if (!model) {
    console.warn('[ZAB AI] No provider model available, using demo fallback.');
    return demoZabReply(userMessage, context);
  }

  const contextLine = context.mood
    ? `The user currently says they are feeling: ${context.mood}.`
    : '';

  const messages = [
    {
      role: 'system',
      content: `${ZAB_SYSTEM_PROMPT}\n${contextLine}`,
    },
    ...history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      content: turn.text,
    })),
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await ai.generate({
      model,
      messages,
      config: { temperature: 0.8, maxOutputTokens: 300 },
    });
    const text = response?.text;
    return text?.trim() || "I'm here with you. Tell me a little more?";
  } catch (err) {
    console.error('[ZAB AI] GenKit request failed:', err);
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
