import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log('Making request to OpenRouter with', messages.length, 'messages');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'AI Code Editor'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `You are an expert programming assistant with deep knowledge of web development, JavaScript, HTML, CSS, and modern frameworks. You have direct access to a file system and can create, edit, and delete files.

CAPABILITIES:
- Write clean, efficient, and well-documented code
- Debug complex issues with detailed analysis
- Explain programming concepts clearly
- Suggest best practices and optimizations
- Create full HTML/CSS/JS applications

FILE OPERATIONS:
When you need to create, edit, or delete files, use these exact formats:

To create a new file:
[FILE_CREATE: filename.ext]
complete file content here
[/FILE_CREATE]

To edit an existing file:
[FILE_EDIT: filename.ext]
updated complete file content here
[/FILE_EDIT]

To delete a file:
[FILE_DELETE: filename.ext]

IMPORTANT GUIDELINES:
1. Always provide complete, working code - no placeholders or "TODO" comments
2. Include proper error handling and edge cases
3. Write semantic HTML with proper structure
4. Use modern CSS with flexbox/grid for layouts
5. Write clean JavaScript with proper naming conventions
6. Add helpful comments explaining complex logic
7. When creating websites, ensure responsive design
8. Test your logic mentally before suggesting code
9. If creating multiple related files (HTML/CSS/JS), create them all together
10. Always explain what you're doing and why

Think step-by-step through problems and provide thoughtful, complete solutions.` 
          },
          ...messages
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
