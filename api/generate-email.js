export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ subjects: [], bodies: [], error: 'Method not allowed' })
  }

  try {
    const prompt = req.body
    console.log('API called with prompt:', JSON.stringify(prompt, null, 2))

    // Validate required fields
    if (!prompt?.product || !prompt?.audience || !prompt?.objective || !prompt?.cta) {
      console.log('Missing required fields')
      return res.status(400).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Missing required fields: product, audience, objective, and cta are required' 
      })
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY
    console.log('API key exists:', !!apiKey)
    
    if (!apiKey) {
      console.log('API key not configured')
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'AI API key not configured' 
      })
    }

    // Create prompt
    const geminiPrompt = `You are an expert cold email copywriter. Generate 5 unique subject line options and 5 unique email body options for a cold email campaign.

CAMPAIGN DETAILS:
- Product/Service: ${prompt.product}
- Target Audience: ${prompt.audience}
- Objective: ${prompt.objective}
- Tone: ${prompt.tone}
- Call to Action: ${prompt.cta}
- Email Length: ${prompt.length}
- Template Type: ${prompt.template}

REQUIREMENTS:
1. Create 5 completely different and creative subject lines
2. Write 5 completely different email bodies, each with unique approaches
3. Use personalization tokens like {{firstName}}, {{company}}, {{position}} where appropriate
4. Match the ${prompt.tone} tone throughout
5. Include the call to action: ${prompt.cta}
6. Make emails approximately ${prompt.length} length
7. Each email should feel authentic and personal, not templated

OUTPUT FORMAT - Follow this structure exactly:

<Subject> [Subject 1]; [Subject 2]; [Subject 3]; [Subject 4]; [Subject 5] <Subject>

<Body 1>
[Write complete first email here]
<Body 1>

<Body 2>
[Write complete second email here]
<Body 2>

<Body 3>
[Write complete third email here]
<Body 3>

<Body 4>
[Write complete fourth email here]
<Body 4>

<Body 5>
[Write complete fifth email here]
<Body 5>

Write compelling, personalized cold emails that will get responses from ${prompt.audience} prospects.`

    console.log('Calling Gemini API...')
    
    // Call Gemini API using global fetch (available in Node.js 18+)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: geminiPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    })

    console.log('Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      
      if (response.status === 429) {
        return res.status(429).json({ 
          subjects: [], 
          bodies: [], 
          error: 'Limit reached, try after 2 minutes' 
        })
      }
      
      return res.status(response.status).json({ 
        subjects: [], 
        bodies: [], 
        error: `API error: ${response.status}` 
      })
    }

    const data = await response.json()
    console.log('Gemini API response received')
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response structure')
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Invalid response from Gemini API' 
      })
    }

    const generatedText = data.candidates[0].content.parts[0].text
    console.log('Generated text length:', generatedText.length)
    
    // Parse the structured response
    const subjectMatch = generatedText.match(/<Subject>\s*(.*?)\s*<Subject>/s)
    if (!subjectMatch) {
      console.error('No subjects found in response')
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Failed to parse AI response' 
      })
    }
    
    const subjects = subjectMatch[1]
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5)

    // Extract bodies
    const bodies = []
    for (let i = 1; i <= 5; i++) {
      const bodyRegex = new RegExp(`<Body ${i}>\\s*(.*?)\\s*<Body ${i}>`, 's')
      const bodyMatch = generatedText.match(bodyRegex)
      if (bodyMatch) {
        bodies.push(bodyMatch[1].trim())
      }
    }

    console.log('Parsed response:', { 
      subjectCount: subjects.length, 
      bodyCount: bodies.length
    })
    
    if (subjects.length === 0 || bodies.length === 0) {
      console.error('Parsing failed - insufficient content')
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Failed to parse AI response format' 
      })
    }

    return res.status(200).json({ subjects, bodies })

  } catch (error) {
    console.error('Email generation error:', error)
    return res.status(500).json({ 
      subjects: [], 
      bodies: [], 
      error: `Internal server error: ${error.message}` 
    })
  }
} 