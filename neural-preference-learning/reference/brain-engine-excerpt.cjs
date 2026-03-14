/**
 * Neural Preference Learning — Brain Engine Excerpt (Simplified)
 * 
 * Simplified reference showing key concepts from the BrainJar spiking
 * neural network engine for preference neuron stimulation.
 * 
 * This is a didactic excerpt aligned with the paper's architecture.
 * The production system uses extended logic and additional parameters.
 * Full engine: https://github.com/JoeSzeles/openclaw-mechanicus
 * Path: skills/bots/brain-engine-server.cjs
 */

/**
 * Stimulate preference neurons with a feature vector.
 * 
 * Maps each feature to its allocated neuron population using population coding.
 * Each neuron receives stimulation proportional to:
 *   feature_value * gaussian(neuron_position, mean=population_center, sigma=population_width/4)
 * 
 * @param {object} featureVector - { responseLength, toolCount, hadCode, ... }
 * @returns {Float32Array} input - Current injections for all sensory neurons
 */
function stimulateFromPreference(featureVector) {
  const input = new Float32Array(N_SENSORY);
  const pref = sensoryAssignments.preference;
  if (!pref) return input;

  const features = Object.entries(featureVector);
  const perFeature = Math.max(1, Math.floor(pref.count / Math.max(features.length, 1)));

  for (let fi = 0; fi < features.length; fi++) {
    const [, val] = features[fi];
    const numVal = typeof val === "number" ? val : (val ? 1 : 0);
    const base = pref.start + fi * perFeature;
    for (let ni = 0; ni < perFeature; ni++) {
      const idx = base + ni;
      if (idx >= pref.start + pref.count) break;
      const center = perFeature / 2;
      const dist = (ni - center) / (perFeature / 4 || 1);
      const activation = numVal * Math.exp(-0.5 * dist * dist);
      input[idx] = activation * w_syn;
    }
  }
  return input;
}

/**
 * Sensory neuron allocation with 20% preference zone.
 * Called on boot to establish neuron regions.
 * 
 * Dual-purpose mode: When existing weights are loaded,
 * preference maps to upper antenna range (preserving trained synapses).
 * Fresh mode: Dedicated 20% zone with reduced antenna.
 */
function recalcSensoryAssignments() {
  const pref = Math.max(6, Math.floor(N_SENSORY * 0.20));
  const remaining = N_SENSORY - pref;
  const priceUp = Math.floor(remaining * 0.225);
  const priceDown = Math.floor(remaining * 0.225);
  const volume = Math.floor(remaining * 0.175);
  const spread = Math.floor(remaining * 0.125);
  const momentum = Math.floor(remaining * 0.125);
  const antenna = remaining - priceUp - priceDown - volume - spread - momentum;

  let offset = 0;
  sensoryAssignments.price_up = { start: offset, count: priceUp };
  offset += priceUp;
  sensoryAssignments.price_down = { start: offset, count: priceDown };
  offset += priceDown;
  sensoryAssignments.volume = { start: offset, count: volume };
  offset += volume;
  sensoryAssignments.spread = { start: offset, count: spread };
  offset += spread;
  sensoryAssignments.momentum = { start: offset, count: momentum };
  offset += momentum;
  sensoryAssignments.antenna = { start: offset, count: antenna };
  offset += antenna;
  sensoryAssignments.preference = { start: offset, count: pref };
}

module.exports = { stimulateFromPreference, recalcSensoryAssignments };
