/**
 * Neural Preference Learning — Feedback Detector (Simplified)
 * 
 * Classifies user message sentiment and triggers neural reinforcement.
 * 
 * This is a simplified, didactic implementation aligned with the paper.
 * The production system at OpenClaw uses extended keyword sets and scoring.
 * See: https://github.com/JoeSzeles/openclaw-mechanicus
 */

const POSITIVE_WORDS = [
  "good", "great", "perfect", "yes", "nice", "excellent", "love", "awesome",
  "correct", "exactly", "thanks", "helpful", "works", "right", "beautiful",
  "amazing", "fantastic", "wonderful", "brilliant", "superb"
];

const NEGATIVE_WORDS = [
  "no", "wrong", "bad", "redo", "fix", "broken", "terrible", "useless",
  "stop", "hate", "awful", "horrible", "worse", "ugly", "stupid",
  "fail", "error", "bug", "crash", "mess"
];

function classifySentiment(text) {
  const lower = (text || "").toLowerCase();
  const words = lower.split(/\s+/);
  let posScore = 0, negScore = 0;
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, "");
    if (POSITIVE_WORDS.includes(clean)) posScore++;
    if (NEGATIVE_WORDS.includes(clean)) negScore++;
  }
  if (posScore > 0 && posScore >= negScore) return { sentiment: "positive", score: posScore };
  if (negScore > 0 && negScore > posScore) return { sentiment: "negative", score: negScore };
  return { sentiment: "neutral", score: 0 };
}

/**
 * Process neural feedback from a user message.
 * 
 * @param {string} userMessage - The user's message text
 * @param {object} lastAgentResponse - { text, agentId, features, ts }
 * @param {function} stimulateBrain - async (features, feedback) => brainResponse
 * @param {function} recordFeedback - async (agentId, features, sentiment, score, brainResponse, text) => void
 */
async function processNeuralFeedback(userMessage, lastAgentResponse, stimulateBrain, recordFeedback) {
  if (!lastAgentResponse || !lastAgentResponse.features) return null;

  const { sentiment, score } = classifySentiment(userMessage);
  if (sentiment === "neutral") return null;

  const feedback = sentiment === "positive" ? "sugar" : "pain";
  const brainResponse = await stimulateBrain(lastAgentResponse.features, feedback);

  await recordFeedback(
    lastAgentResponse.agentId,
    lastAgentResponse.features,
    sentiment,
    score,
    brainResponse,
    userMessage
  );

  return { sentiment, score, feedback, brainResponse };
}

module.exports = { classifySentiment, processNeuralFeedback };
