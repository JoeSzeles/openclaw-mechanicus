/**
 * Neural Preference Learning — Feature Encoder (Simplified)
 * 
 * Extracts a numeric feature vector from an LLM agent's response text,
 * suitable for stimulating spiking neural network preference neurons.
 * 
 * This is a simplified, didactic implementation aligned with the paper.
 * The production system at OpenClaw uses extended features and snake_case keys.
 * See: https://github.com/JoeSzeles/openclaw-mechanicus
 */

function buildFeatureVector(responseText, agentId) {
  const text = responseText || "";
  const len = Math.min(text.length / 2000, 1.0);
  const toolMatches = text.match(/\btool[_\s]?(call|use|result|output)\b/gi);
  const toolCount = toolMatches ? toolMatches.length : 0;
  const hadCode = /```[\s\S]*?```/.test(text) ? 1 : 0;
  const hadData = /\b(table|chart|data|csv|json|result)\b/i.test(text) ? 1 : 0;
  const topicWords = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  let topicHash = 0;
  for (let i = 0; i < Math.min(topicWords.length, 20); i++) {
    for (let c = 0; c < topicWords[i].length; c++) {
      topicHash = (topicHash * 31 + topicWords[i].charCodeAt(c)) % 1000;
    }
  }
  topicHash = topicHash / 1000;
  const wasProactive = /\b(also|additionally|note|tip|suggest|recommend|btw|fyi)\b/i.test(text) ? 1 : 0;
  let agentHash = 0;
  const aid = (agentId || "unknown").toLowerCase();
  for (let c = 0; c < aid.length; c++) {
    agentHash = (agentHash * 31 + aid.charCodeAt(c)) % 1000;
  }

  return {
    responseLength: parseFloat(len.toFixed(3)),
    toolCount,
    hadCode,
    hadData,
    topicHash: parseFloat(topicHash.toFixed(3)),
    wasProactive,
    agentIdHash: parseFloat((agentHash / 1000).toFixed(3)),
  };
}

module.exports = { buildFeatureVector };
