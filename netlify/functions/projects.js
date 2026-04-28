exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  
  const DEFAULT = [{ title: "Corporate Website — TechCorp", category: "web", desc: "Full corporate website with CMS", tags: ["HTML","CSS","JS"], emoji: "🌐", liveUrl: "", thumbnail: "" }];
  
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('portfolio-store');
    
    if (event.httpMethod === 'GET') {
      let projects = await store.get('projects', { type: 'json' });
      if (!projects) { await store.set('projects', JSON.stringify(DEFAULT)); projects = DEFAULT; }
      return { statusCode: 200, headers, body: JSON.stringify(projects) };
    }
    
    if (event.httpMethod === 'POST') {
      await store.set('projects', event.body);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }
    
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};