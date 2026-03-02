async function updateLivePrices() {
  var streamBadge = document.getElementById('streamBadge');
  var data = await apiFetch('/api/ig/stream/prices');
  if (!data) {
    if (streamBadge) streamBadge.innerHTML = '<span class="badge badge-off">POLLING</span>';
    return;
  }
  var isStreaming = data.streaming === true;
  if (streamBadge) {
    if (isStreaming) {
      streamBadge.innerHTML = '<span class="badge badge-live">STREAMING</span>';
    } else {
      streamBadge.innerHTML = '<span class="badge badge-off">POLLING</span>';
    }
  }
  var prices = data.prices || {};
  var epics = Object.keys(prices);

  for (var k = 0; k < epics.length; k++) {
    var ep = epics[k];
    var pp = prices[ep];
    var bid = pp.bid != null ? pp.bid : 0;
    var offer = pp.offer != null ? pp.offer : 0;
    livePrices[ep] = { bid: bid, offer: offer, mid: (bid + offer) / 2, marketState: pp.marketState, timestamp: pp.timestamp };
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
