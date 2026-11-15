import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    // Accept either 'prompt' or 'message' from the frontend payload
    const prompt = body.prompt || body.message;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY || !env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ 
        error: "Server configuration error: Missing Supabase or Gemini API keys." 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Call Gemini API (Gemini 1.5 Flash)
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { 
                  text: `You are PyBot, a friendly and expert Python programming tutor for the "pyflow-curriculum" project. Explain Python concepts clearly with code examples when appropriate. User question: ${prompt}` 
                }
              ]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const botResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    // Initialize Supabase and log the conversation
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);

    const { error: dbError } = await supabase
      .from('chat_logs')
      .insert([{ user_prompt: prompt, response: botResponse }]);

    if (dbError) {
      console.error("Database insert error:", dbError);
    }

    return new Response(JSON.stringify({ response: botResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}