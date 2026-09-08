const apiKey = "AIzaSyDxwFLgY6xiCkxEWjS7io1FsCdntMfdsK0";
const models = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-1.0-pro"];

async function testGemini() {
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "안녕 Gemini!" }] }]
        })
      });
      const data = await res.json();
      console.log(`[${model}] Status: ${res.status}`, JSON.stringify(data).substring(0, 150));
    } catch (err) {
      console.error(`[${model}] Error:`, err.message);
    }
  }
}

testGemini();
