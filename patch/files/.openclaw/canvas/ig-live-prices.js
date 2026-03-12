async function updateLivePrices() {
  var streamBadge = document.getElementById('streamBadge');
  var data = await apiFetch('/api/ig/stream/prices');
  if (!data) {
    if (streamBadge) streamBadge.innerHTML = '<span class="badge badge-alert">NO DATA</span>';
    return;
  }
  var isStreaming = data.streaming === true;
  var isPolling = data.polling === true;
  var method = data.method || 'none';
  if (streamBadge) {
    var count = 0;
    var prices = data.prices || {};
    var epics = Object.keys(prices);
    for (var c = 0; c < epics.length; c++) { if (epics[c] !== '__ACCOUNT__') count++; }
    if (isStreaming) {
      streamBadge.innerHTML = '<span class="badge badge-live">LIGHTSTREAMER (' + count + ')</span>';
    } else if (isPolling && count > 0) {
      streamBadge.innerHTML = '<span class="badge badge-spike">REST POLL (' + count + ')</span>';
    } else if (isPolling) {
      streamBadge.innerHTML = '<span class="badge badge-off">REST POLL (0)</span>';
    } else {
      streamBadge.innerHTML = '<span class="badge badge-off">NO FEED</span>';
    }
  }
  var prices = data.prices || {};
  var epics = Object.keys(prices);

  for (var k = 0; k < epics.length; k++) {
    var ep = epics[k];
    if (ep === '__ACCOUNT__') continue;
    var pp = prices[ep];
    var bid = pp.bid != null ? pp.bid : 0;
    var offer = pp.offer != null ? pp.offer : 0;
    livePrices[ep] = { bid: bid, offer: offer, mid: (bid + offer) / 2, marketState: pp.marketState, timestamp: pp.timestamp };
    if (typeof feedLiveTick === 'function') feedLiveTick(ep, (bid + offer) / 2);
  }
  renderWatchlistTabs();

  if (selectedEpic && prices[selectedEpic]) {
    var sp = prices[selectedEpic];
    if (selectedMarketData) {
      selectedMarketData.snapshot = selectedMarketData.snapshot || {};
      selectedMarketData.snapshot.bid = sp.bid;
      selectedMarketData.snapshot.offer = sp.offer;
      selectedMarketData.snapshot.marketStatus = sp.marketState;
      updateDealPanel(selectedMarketData);
    }
  }
}
