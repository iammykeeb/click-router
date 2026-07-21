// functions/index.js
// This runs on Cloudflare's edge network

export async function onRequest(context) {
  // 1. Extract parameters from the URL
  const { request, url, waitUntil } = context;
  const searchParams = new URL(url).searchParams;
  
  const keyword = searchParams.get('keyword') || 'default-search';
  const userId = searchParams.get('uid') || 'anonymous';

  // 2. The Async Trigger (Background - user does NOT wait for this)
  // TEMPORARY: We use webhook.site to test the trigger.
  // In Phase 3, we will replace this with your Google Cloud Run URL.
  const MOCK_BOT_ENDPOINT = 'https://webhook.site/your-unique-id'; 
  // 👆 Go to webhook.site (free), copy YOUR unique URL, and paste it here.

  // Fire the request in the background using `waitUntil`.
  // This ensures the fetch completes even after we send the user's response.
  waitUntil(
    fetch(MOCK_BOT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'trigger_search',
        userId: userId,
        keyword: keyword,
        timestamp: Date.now(),
      }),
    }).catch(err => {
      // Silently log errors; never break the user redirect
      console.error('Background bot trigger failed:', err);
    })
  );

  // 3. Hardcoded Destination (Temporary)
  // In Phase 4, the bot will dynamically replace this URL.
  const finalDestination = `https://example.com/?q=${encodeURIComponent(keyword)}&ref=${userId}`;

  // 4. Return the HTML Loading Page + Auto-Redirect
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <style>
      body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; background: #f8f9fa; }
      .container { text-align: center; padding: 2rem; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .spinner { width: 40px; height: 40px; border: 4px solid #e9ecef; border-top: 4px solid #4263eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 1rem auto; }
      @keyframes spin { 100% { transform: rotate(360deg); } }
      .keyword-tag { background: #e9ecef; padding: 0.2rem 0.8rem; border-radius: 20px; font-size: 0.9rem; }
    </style>
    <script>
      // JavaScript redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "${finalDestination}";
      }, 2000);
    </script>
  </head>
  <body>
    <div class="container">
      <div class="spinner"></div>
      <h3>Loading your experience...</h3>
      <p>Searching for: <span class="keyword-tag">${keyword}</span></p>
      <p style="font-size: 0.8rem; margin-top: 1.5rem; color: #888;">You will be redirected automatically.</p>
    </div>
  </body>
  </html>`;

  // 5. Return the HTML immediately (status 200)
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
      }
