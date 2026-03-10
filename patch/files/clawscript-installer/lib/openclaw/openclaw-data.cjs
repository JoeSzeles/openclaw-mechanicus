'use strict';

async function clawWeb(url, options = {}) {
  const pages = options.pages || 1;
  console.log(`[openclaw-data] clawWeb url="${url}" pages=${pages}`);
  return {
    content: `Web content from ${url}`,
    title: `Page at ${url}`,
    pages,
    links: [],
    fetched: new Date().toISOString()
  };
}

async function clawX(query, options = {}) {
  const num = options.limit || options.num || 10;
  const filter = options.mode || options.filter || 'latest';
  console.log(`[openclaw-data] clawX query="${query}" num=${num} filter=${filter}`);
  return {
    posts: Array.from({ length: Math.min(num, 5) }, (_, i) => ({
      id: `post_${i}`,
      text: `Mock post ${i + 1} about ${query}`,
      author: `user_${i}`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      likes: Math.floor(Math.random() * 100)
    })),
    query,
    total: num
  };
}

async function clawPdf(url, options = {}) {
  const pages = options.pages || 'all';
  console.log(`[openclaw-data] clawPdf url="${url}" pages=${pages}`);
  return {
    text: `Extracted PDF content from ${url}`,
    pages: typeof pages === 'number' ? pages : 10,
    url,
    extracted: new Date().toISOString()
  };
}

async function clawImage(url, options = {}) {
  const instructions = options.instructions || 'describe';
  console.log(`[openclaw-data] clawImage url="${url}" instructions="${instructions}"`);
  return {
    description: `Image analysis of ${url}: visual content detected`,
    labels: ['chart', 'data', 'financial'],
    url,
    confidence: 0.92
  };
}

async function clawVideo(url, options = {}) {
  const mode = options.mode || 'summarize';
  console.log(`[openclaw-data] clawVideo url="${url}" mode=${mode}`);
  return {
    summary: `Video summary of ${url}`,
    duration: 120,
    keyFrames: 5,
    url,
    mode
  };
}

async function clawImageView(url, options = {}) {
  console.log(`[openclaw-data] clawImageView url="${url}"`);
  return {
    viewed: true,
    url,
    dimensions: { width: 1920, height: 1080 },
    format: 'png'
  };
}

async function clawConversation(sessionId, options = {}) {
  const num = options.num || 20;
  console.log(`[openclaw-data] clawConversation session="${sessionId}" num=${num}`);
  return {
    messages: Array.from({ length: Math.min(num, 3) }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Mock message ${i + 1} in session ${sessionId}`,
      timestamp: new Date(Date.now() - i * 60000).toISOString()
    })),
    sessionId,
    total: num
  };
}

module.exports = { clawWeb, clawX, clawPdf, clawImage, clawVideo, clawImageView, clawConversation };
