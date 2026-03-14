/**
 * Neural Preference Learning — Basic Feedback Loop Example
 * 
 * Demonstrates the core feedback cycle:
 * 1. Agent produces a response
 * 2. User gives feedback
 * 3. System classifies sentiment
 * 4. Feature vector is extracted
 * 5. Brain is stimulated with sugar/pain
 * 
 * This is a standalone example — in production, these components
 * are integrated into the OpenClaw multi-agent platform.
 */

const { buildFeatureVector } = require("../reference/feature-encoder.cjs");
const { classifySentiment } = require("../reference/feedback-detector.cjs");

// Simulated conversation
const conversation = [
  { role: "agent", text: "Here's a detailed analysis of BTC price movements with code examples and chart data...", agentId: "ceo" },
  { role: "user", text: "Great analysis, exactly what I needed!" },
  { role: "agent", text: "ok", agentId: "ceo" },
  { role: "user", text: "That's terrible, give me more detail" },
  { role: "agent", text: "I've prepared a comprehensive report with data tables, code snippets for the trading strategy, and also included risk analysis as an extra consideration.", agentId: "ceo" },
  { role: "user", text: "Perfect, this is brilliant work" },
];

console.log("=== Neural Preference Learning Demo ===\n");

let lastAgentResponse = null;
let feedbackLog = [];

for (const msg of conversation) {
  if (msg.role === "agent") {
    const features = buildFeatureVector(msg.text, msg.agentId);
    lastAgentResponse = { text: msg.text, agentId: msg.agentId, features };
    console.log(`[Agent ${msg.agentId}]: "${msg.text.slice(0, 80)}..."`);
    console.log(`  Features: len=${features.responseLength} code=${features.hadCode} data=${features.hadData} proactive=${features.wasProactive}`);
  } else {
    console.log(`[User]: "${msg.text}"`);
    const { sentiment, score } = classifySentiment(msg.text);
    console.log(`  Sentiment: ${sentiment} (score: ${score})`);

    if (sentiment !== "neutral" && lastAgentResponse) {
      const feedback = sentiment === "positive" ? "sugar" : "pain";
      console.log(`  -> Would stimulate brain with ${feedback} for features:`, lastAgentResponse.features);
      feedbackLog.push({
        sentiment,
        feedback,
        features: lastAgentResponse.features,
        userText: msg.text
      });
    }
    console.log();
  }
}

console.log("=== Feedback Summary ===");
console.log(`Total feedback events: ${feedbackLog.length}`);
console.log(`Sugar (positive): ${feedbackLog.filter(f => f.feedback === "sugar").length}`);
console.log(`Pain (negative): ${feedbackLog.filter(f => f.feedback === "pain").length}`);
console.log("\nThe brain would learn:");
console.log("- User prefers longer, detailed responses (sugar for long responses)");
console.log("- User dislikes terse responses (pain for short response)");
console.log("- User values proactive additions (sugar for proactive responses)");
