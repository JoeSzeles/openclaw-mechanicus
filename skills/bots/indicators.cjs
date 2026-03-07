function calcEMA(prices, period) {
  if (!prices || prices.length < period) return null;
  try {
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((s, v) => s + v, 0) / period;
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
  } catch (e) { return null; }
}

function calcEMASeries(prices, period) {
  if (!prices || prices.length < period) return [];
  try {
    const k = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((s, v) => s + v, 0) / period;
    const series = new Array(period - 1).fill(null);
    series.push(ema);
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
      series.push(ema);
    }
    return series;
  } catch (e) { return []; }
}

function calcSMA(prices, period) {
  if (!prices || prices.length < period) return null;
  try {
    return prices.slice(-period).reduce((s, v) => s + v, 0) / period;
  } catch (e) { return null; }
}

function calcSMASeries(prices, period) {
  if (!prices || prices.length < period) return [];
  try {
    const series = [];
    for (let i = 0; i <= prices.length - period; i++) {
      let sum = 0;
      for (let j = i; j < i + period; j++) sum += prices[j];
      series.push(sum / period);
    }
    return series;
  } catch (e) { return []; }
}

function downsampleTicks(ticks, numBars) {
  if (!ticks || ticks.length === 0) return [];
  try {
    if (ticks.length <= numBars) return ticks.map(t => typeof t === "number" ? t : t.mid);
    const barSize = Math.floor(ticks.length / numBars);
    const bars = [];
    for (let i = 0; i < numBars; i++) {
      const start = i * barSize;
      const end = i === numBars - 1 ? ticks.length : (i + 1) * barSize;
      let sum = 0;
      for (let j = start; j < end; j++) sum += (typeof ticks[j] === "number" ? ticks[j] : ticks[j].mid);
      bars.push(sum / (end - start));
    }
    return bars;
  } catch (e) { return []; }
}

function calcRSI(prices, period) {
  if (!prices || prices.length < period + 1) return null;
  try {
    let avgGain = 0, avgLoss = 0;
    for (let i = 1; i <= period; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) avgGain += diff; else avgLoss -= diff;
    }
    avgGain /= period;
    avgLoss /= period;
    for (let i = period + 1; i < prices.length; i++) {
      const diff = prices[i] - prices[i - 1];
      if (diff > 0) {
        avgGain = (avgGain * (period - 1) + diff) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - diff) / period;
      }
    }
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  } catch (e) { return null; }
}

function calcMACD(prices, fast, slow, signalPeriod) {
  if (!prices || prices.length < slow + signalPeriod) return null;
  try {
    const k = 2 / (fast + 1);
    const ks = 2 / (slow + 1);
    let fEma = prices.slice(0, fast).reduce((s, v) => s + v, 0) / fast;
    let sEma = prices.slice(0, slow).reduce((s, v) => s + v, 0) / slow;
    const macdSeries = [];
    for (let i = slow; i < prices.length; i++) {
      if (i >= fast) fEma = prices[i] * k + fEma * (1 - k);
      sEma = prices[i] * ks + sEma * (1 - ks);
      macdSeries.push(fEma - sEma);
    }
    if (macdSeries.length < signalPeriod) return null;
    const sigK = 2 / (signalPeriod + 1);
    let sig = macdSeries.slice(0, signalPeriod).reduce((s, v) => s + v, 0) / signalPeriod;
    for (let i = signalPeriod; i < macdSeries.length; i++) {
      sig = macdSeries[i] * sigK + sig * (1 - sigK);
    }
    const macdLine = macdSeries[macdSeries.length - 1];
    const histogram = macdLine - sig;
    return { macdLine, signalLine: sig, histogram };
  } catch (e) { return null; }
}

function calcATR(highs, lows, closes, period) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < period + 1) return null;
  try {
    const trs = [];
    for (let i = 1; i < len; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trs.push(tr);
    }
    if (trs.length < period) return null;
    let atr = trs.slice(0, period).reduce((s, v) => s + v, 0) / period;
    for (let i = period; i < trs.length; i++) {
      atr = (atr * (period - 1) + trs[i]) / period;
    }
    return atr;
  } catch (e) { return null; }
}

function calcATRFromTicks(prices, period) {
  if (!prices || prices.length < period + 1) return null;
  try {
    const trs = [];
    for (let i = 1; i < prices.length; i++) {
      trs.push(Math.abs(prices[i] - prices[i - 1]));
    }
    if (trs.length < period) return null;
    let atr = trs.slice(0, period).reduce((s, v) => s + v, 0) / period;
    for (let i = period; i < trs.length; i++) {
      atr = (atr * (period - 1) + trs[i]) / period;
    }
    return atr;
  } catch (e) { return null; }
}

function calcADX(highs, lows, closes, period) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < period * 2 + 1) return null;
  try {
    const plusDM = [], minusDM = [], trs = [];
    for (let i = 1; i < len; i++) {
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
      trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
    }
    if (trs.length < period) return null;
    let smoothTR = trs.slice(0, period).reduce((s, v) => s + v, 0);
    let smoothPlusDM = plusDM.slice(0, period).reduce((s, v) => s + v, 0);
    let smoothMinusDM = minusDM.slice(0, period).reduce((s, v) => s + v, 0);
    const dxValues = [];
    for (let i = period; i < trs.length; i++) {
      smoothTR = smoothTR - smoothTR / period + trs[i];
      smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i];
      smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i];
      const plusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
      const minusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0;
      const diSum = plusDI + minusDI;
      const dx = diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0;
      dxValues.push(dx);
    }
    if (dxValues.length < period) return null;
    let adx = dxValues.slice(0, period).reduce((s, v) => s + v, 0) / period;
    for (let i = period; i < dxValues.length; i++) {
      adx = (adx * (period - 1) + dxValues[i]) / period;
    }
    const lastPlusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
    const lastMinusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0;
    return { adx, plusDI: lastPlusDI, minusDI: lastMinusDI };
  } catch (e) { return null; }
}

function calcADXFromPrices(prices, period) {
  if (!prices || prices.length < period * 2 + 1) return null;
  return calcADX(prices, prices, prices, period);
}

function calcROC(prices, period) {
  if (!prices || prices.length < period + 1) return null;
  try {
    const current = prices[prices.length - 1];
    const past = prices[prices.length - 1 - period];
    if (past === 0) return null;
    return ((current - past) / past) * 100;
  } catch (e) { return null; }
}

function calcBollinger(prices, period, sd) {
  if (!prices || prices.length < period) return null;
  try {
    const slice = prices.slice(-period);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    return {
      upper: mean + sd * stdDev,
      middle: mean,
      lower: mean - sd * stdDev,
      bandwidth: stdDev * sd * 2,
      percentB: stdDev > 0 ? (prices[prices.length - 1] - (mean - sd * stdDev)) / (sd * stdDev * 2) : 0.5
    };
  } catch (e) { return null; }
}

function calcStochastic(highs, lows, closes, kPeriod, dPeriod) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < kPeriod + dPeriod) return null;
  try {
    const kValues = [];
    for (let i = kPeriod - 1; i < len; i++) {
      let highN = -Infinity, lowN = Infinity;
      for (let j = i - kPeriod + 1; j <= i; j++) {
        if (highs[j] > highN) highN = highs[j];
        if (lows[j] < lowN) lowN = lows[j];
      }
      const range = highN - lowN;
      kValues.push(range > 0 ? ((closes[i] - lowN) / range) * 100 : 50);
    }
    if (kValues.length < dPeriod) return null;
    const dValue = kValues.slice(-dPeriod).reduce((s, v) => s + v, 0) / dPeriod;
    return { k: kValues[kValues.length - 1], d: dValue };
  } catch (e) { return null; }
}

function calcStochasticFromPrices(prices, kPeriod, dPeriod) {
  if (!prices || prices.length < kPeriod + dPeriod) return null;
  return calcStochastic(prices, prices, prices, kPeriod, dPeriod);
}

function calcCCI(highs, lows, closes, period) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < period) return null;
  try {
    const typicals = [];
    for (let i = 0; i < len; i++) {
      typicals.push((highs[i] + lows[i] + closes[i]) / 3);
    }
    const slice = typicals.slice(-period);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const meanDev = slice.reduce((s, v) => s + Math.abs(v - mean), 0) / period;
    if (meanDev === 0) return 0;
    return (typicals[typicals.length - 1] - mean) / (0.015 * meanDev);
  } catch (e) { return null; }
}

function calcCCIFromPrices(prices, period) {
  if (!prices || prices.length < period) return null;
  return calcCCI(prices, prices, prices, period);
}

function calcWilliamsR(highs, lows, closes, period) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < period) return null;
  try {
    let highN = -Infinity, lowN = Infinity;
    for (let i = len - period; i < len; i++) {
      if (highs[i] > highN) highN = highs[i];
      if (lows[i] < lowN) lowN = lows[i];
    }
    const range = highN - lowN;
    if (range === 0) return -50;
    return ((highN - closes[len - 1]) / range) * -100;
  } catch (e) { return null; }
}

function calcWilliamsRFromPrices(prices, period) {
  if (!prices || prices.length < period) return null;
  return calcWilliamsR(prices, prices, prices, period);
}

function calcUltimateOscillator(highs, lows, closes) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < 29) return null;
  try {
    const bp = [], tr = [];
    for (let i = 1; i < len; i++) {
      const prevClose = closes[i - 1];
      const trueLow = Math.min(lows[i], prevClose);
      const trueRange = Math.max(highs[i], prevClose) - trueLow;
      bp.push(closes[i] - trueLow);
      tr.push(trueRange);
    }
    const sum = (arr, start, count) => {
      let s = 0;
      for (let i = start; i < start + count && i < arr.length; i++) s += arr[i];
      return s;
    };
    const n = bp.length;
    const bp7 = sum(bp, n - 7, 7), tr7 = sum(tr, n - 7, 7);
    const bp14 = sum(bp, n - 14, 14), tr14 = sum(tr, n - 14, 14);
    const bp28 = sum(bp, n - 28, 28), tr28 = sum(tr, n - 28, 28);
    const avg7 = tr7 > 0 ? bp7 / tr7 : 0;
    const avg14 = tr14 > 0 ? bp14 / tr14 : 0;
    const avg28 = tr28 > 0 ? bp28 / tr28 : 0;
    return ((4 * avg7 + 2 * avg14 + avg28) / 7) * 100;
  } catch (e) { return null; }
}

function calcParabolicSAR(highs, lows, accelInit, accelMax) {
  if (!highs || !lows || highs.length < 3) return null;
  const af0 = accelInit || 0.02;
  const afMax = accelMax || 0.2;
  try {
    let isLong = highs[1] > highs[0];
    let sar = isLong ? lows[0] : highs[0];
    let ep = isLong ? highs[1] : lows[1];
    let af = af0;
    const sarValues = [sar, sar];
    for (let i = 2; i < highs.length; i++) {
      sar = sar + af * (ep - sar);
      if (isLong) {
        sar = Math.min(sar, lows[i - 1], lows[i - 2]);
        if (lows[i] < sar) {
          isLong = false;
          sar = ep;
          ep = lows[i];
          af = af0;
        } else {
          if (highs[i] > ep) { ep = highs[i]; af = Math.min(af + af0, afMax); }
        }
      } else {
        sar = Math.max(sar, highs[i - 1], highs[i - 2]);
        if (highs[i] > sar) {
          isLong = true;
          sar = ep;
          ep = highs[i];
          af = af0;
        } else {
          if (lows[i] < ep) { ep = lows[i]; af = Math.min(af + af0, afMax); }
        }
      }
      sarValues.push(sar);
    }
    return { sar: sarValues[sarValues.length - 1], isLong, series: sarValues };
  } catch (e) { return null; }
}

function calcParabolicSARFromPrices(prices, accelInit, accelMax) {
  if (!prices || prices.length < 3) return null;
  return calcParabolicSAR(prices, prices, accelInit, accelMax);
}

function calcIchimoku(highs, lows, closes, tenkan, kijun, senkou) {
  if (!highs || !lows || !closes) return null;
  const len = Math.min(highs.length, lows.length, closes.length);
  if (len < senkou) return null;
  try {
    const midHL = (arr, start, period) => {
      let h = -Infinity, l = Infinity;
      for (let i = start; i < start + period && i < arr.length; i++) {
        if (highs[i] > h) h = highs[i];
        if (lows[i] < l) l = lows[i];
      }
      return (h + l) / 2;
    };
    const tenkanSen = midHL(null, len - tenkan, tenkan);
    const kijunSen = midHL(null, len - kijun, kijun);
    const senkouA = (tenkanSen + kijunSen) / 2;
    const senkouB = midHL(null, len - senkou, senkou);
    const chikouSpan = closes[len - 1];
    const currentPrice = closes[len - 1];
    const aboveCloud = currentPrice > Math.max(senkouA, senkouB);
    const belowCloud = currentPrice < Math.min(senkouA, senkouB);
    return { tenkanSen, kijunSen, senkouA, senkouB, chikouSpan, aboveCloud, belowCloud, inCloud: !aboveCloud && !belowCloud };
  } catch (e) { return null; }
}

function calcIchimokuFromPrices(prices, tenkan, kijun, senkou) {
  if (!prices || prices.length < senkou) return null;
  return calcIchimoku(prices, prices, prices, tenkan, kijun, senkou);
}

function calcAroon(highs, lows, period) {
  if (!highs || !lows) return null;
  const len = Math.min(highs.length, lows.length);
  if (len < period + 1) return null;
  try {
    let highIdx = 0, lowIdx = 0;
    let maxH = -Infinity, minL = Infinity;
    for (let i = len - period - 1; i < len; i++) {
      if (highs[i] >= maxH) { maxH = highs[i]; highIdx = i; }
      if (lows[i] <= minL) { minL = lows[i]; lowIdx = i; }
    }
    const daysSinceHigh = (len - 1) - highIdx;
    const daysSinceLow = (len - 1) - lowIdx;
    const aroonUp = ((period - daysSinceHigh) / period) * 100;
    const aroonDown = ((period - daysSinceLow) / period) * 100;
    return { up: aroonUp, down: aroonDown, oscillator: aroonUp - aroonDown };
  } catch (e) { return null; }
}

function calcAroonFromPrices(prices, period) {
  if (!prices || prices.length < period + 1) return null;
  return calcAroon(prices, prices, period);
}

function calcChaikinVolatility(highs, lows, emaPeriod, rocPeriod) {
  if (!highs || !lows) return null;
  const len = Math.min(highs.length, lows.length);
  if (len < emaPeriod + rocPeriod) return null;
  try {
    const hlDiff = [];
    for (let i = 0; i < len; i++) hlDiff.push(highs[i] - lows[i]);
    const emaSeries = calcEMASeries(hlDiff, emaPeriod);
    const validEma = emaSeries.filter(v => v !== null);
    if (validEma.length < rocPeriod + 1) return null;
    const current = validEma[validEma.length - 1];
    const past = validEma[validEma.length - 1 - rocPeriod];
    if (past === 0) return 0;
    return ((current - past) / past) * 100;
  } catch (e) { return null; }
}

function calcKeltner(prices, period, atrMult, atrPeriod) {
  if (!prices || prices.length < Math.max(period, (atrPeriod || period) + 1)) return null;
  try {
    const mid = calcEMA(prices, period);
    if (mid === null) return null;
    const atr = calcATRFromTicks(prices, atrPeriod || period);
    if (atr === null) return null;
    return {
      upper: mid + atrMult * atr,
      middle: mid,
      lower: mid - atrMult * atr,
      atr
    };
  } catch (e) { return null; }
}

function calcOBV(closes, volumes) {
  if (!closes || !volumes || closes.length < 2) return null;
  const len = Math.min(closes.length, volumes.length);
  if (len < 2) return null;
  try {
    let obv = 0;
    const series = [0];
    for (let i = 1; i < len; i++) {
      if (closes[i] > closes[i - 1]) obv += (volumes[i] || 0);
      else if (closes[i] < closes[i - 1]) obv -= (volumes[i] || 0);
      series.push(obv);
    }
    return { obv, series };
  } catch (e) { return null; }
}

function calcVWAP(highs, lows, closes, volumes) {
  if (!highs || !lows || !closes || !volumes) return null;
  const len = Math.min(highs.length, lows.length, closes.length, volumes.length);
  if (len < 1) return null;
  try {
    let cumTPV = 0, cumVol = 0;
    for (let i = 0; i < len; i++) {
      const tp = (highs[i] + lows[i] + closes[i]) / 3;
      const vol = volumes[i] || 1;
      cumTPV += tp * vol;
      cumVol += vol;
    }
    return cumVol > 0 ? cumTPV / cumVol : null;
  } catch (e) { return null; }
}

function calcCMF(highs, lows, closes, volumes, period) {
  if (!highs || !lows || !closes || !volumes) return null;
  const len = Math.min(highs.length, lows.length, closes.length, volumes.length);
  if (len < period) return null;
  try {
    let mfvSum = 0, volSum = 0;
    for (let i = len - period; i < len; i++) {
      const range = highs[i] - lows[i];
      const mfm = range > 0 ? ((closes[i] - lows[i]) - (highs[i] - closes[i])) / range : 0;
      mfvSum += mfm * (volumes[i] || 0);
      volSum += (volumes[i] || 0);
    }
    return volSum > 0 ? mfvSum / volSum : 0;
  } catch (e) { return null; }
}

function calcZScore(prices, period) {
  if (!prices || prices.length < period) return null;
  try {
    const slice = prices.slice(-period);
    const mean = slice.reduce((s, v) => s + v, 0) / period;
    const variance = slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) return 0;
    return (prices[prices.length - 1] - mean) / stdDev;
  } catch (e) { return null; }
}

function calcFibonacci(prices, lookback) {
  if (!prices || prices.length < lookback || lookback < 2) return null;
  try {
    const slice = prices.slice(-lookback);
    let high = -Infinity, low = Infinity;
    for (const p of slice) {
      if (p > high) high = p;
      if (p < low) low = p;
    }
    const range = high - low;
    if (range === 0) return null;
    const current = prices[prices.length - 1];
    const isUptrend = prices[prices.length - 1] > prices[prices.length - lookback];
    const levels = {
      0: high,
      0.236: high - range * 0.236,
      0.382: high - range * 0.382,
      0.5: high - range * 0.5,
      0.618: high - range * 0.618,
      0.786: high - range * 0.786,
      1: low
    };
    let nearestLevel = null;
    let nearestDist = Infinity;
    for (const [lvl, price] of Object.entries(levels)) {
      const dist = Math.abs(current - price);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestLevel = parseFloat(lvl);
      }
    }
    return { levels, high, low, range, isUptrend, nearestLevel, nearestDistance: nearestDist };
  } catch (e) { return null; }
}

function calcDonchian(highs, lows, period) {
  if (!highs || !lows) return null;
  const len = Math.min(highs.length, lows.length);
  if (len < period) return null;
  try {
    let high = -Infinity, low = Infinity;
    for (let i = len - period; i < len; i++) {
      if (highs[i] > high) high = highs[i];
      if (lows[i] < low) low = lows[i];
    }
    return { upper: high, lower: low, middle: (high + low) / 2 };
  } catch (e) { return null; }
}

function calcDonchianFromPrices(prices, period) {
  if (!prices || prices.length < period) return null;
  return calcDonchian(prices, prices, period);
}

function calcKelly(winRate, avgWin, avgLoss) {
  try {
    if (avgLoss === 0 || !winRate || !avgWin) return null;
    const rr = avgWin / Math.abs(avgLoss);
    const lossRate = 1 - winRate;
    const kelly = (winRate * rr - lossRate) / rr;
    return Math.max(0, Math.min(kelly, 1));
  } catch (e) { return null; }
}

function calcVolumeProfile(closes, volumes, numBins) {
  if (!closes || !volumes || closes.length < 2) return null;
  const bins = numBins || 20;
  const len = Math.min(closes.length, volumes.length);
  try {
    let high = -Infinity, low = Infinity;
    for (let i = 0; i < len; i++) {
      if (closes[i] > high) high = closes[i];
      if (closes[i] < low) low = closes[i];
    }
    const range = high - low;
    if (range === 0) return null;
    const binSize = range / bins;
    const profile = new Array(bins).fill(0);
    for (let i = 0; i < len; i++) {
      const bin = Math.min(Math.floor((closes[i] - low) / binSize), bins - 1);
      profile[bin] += (volumes[i] || 1);
    }
    let pocBin = 0, pocVol = 0;
    for (let i = 0; i < bins; i++) {
      if (profile[i] > pocVol) { pocVol = profile[i]; pocBin = i; }
    }
    const poc = low + (pocBin + 0.5) * binSize;
    return { poc, high, low, profile, binSize };
  } catch (e) { return null; }
}

module.exports = {
  calcEMA, calcEMASeries, calcSMA, calcSMASeries, downsampleTicks,
  calcRSI, calcMACD,
  calcATR, calcATRFromTicks,
  calcADX, calcADXFromPrices,
  calcROC,
  calcBollinger,
  calcStochastic, calcStochasticFromPrices,
  calcCCI, calcCCIFromPrices,
  calcWilliamsR, calcWilliamsRFromPrices,
  calcUltimateOscillator,
  calcParabolicSAR, calcParabolicSARFromPrices,
  calcIchimoku, calcIchimokuFromPrices,
  calcAroon, calcAroonFromPrices,
  calcChaikinVolatility,
  calcKeltner,
  calcOBV, calcVWAP, calcCMF,
  calcZScore,
  calcFibonacci,
  calcDonchian, calcDonchianFromPrices,
  calcKelly,
  calcVolumeProfile
};
