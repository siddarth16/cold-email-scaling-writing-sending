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
    const geminiPrompt = `You are an expert cold email copywriter. Generate 5 different subject line options and 5 different email body options for a cold email campaign.

CAMPAIGN DETAILS:
- Product/Service: ${prompt.product}
- Target Audience: ${prompt.audience}
- Objective: ${prompt.objective}
- Tone: ${prompt.tone}
- Call to Action: ${prompt.cta}
- Email Length: ${prompt.length}
- Template Type: ${prompt.template}

STRICT OUTPUT FORMAT - YOU MUST FOLLOW THIS EXACTLY:

<Subject> Option 1; Option 2; Option 3; Option 4; Option 5 <Subject>

<Body 1>
Hi {{firstName}},

I noticed {{company}} is working with ${prompt.audience}, and I thought ${prompt.product} might be relevant.

We've helped similar companies achieve:
• 30% improvement in efficiency
• Reduced operational costs
• Better ${prompt.audience} outcomes

${prompt.cta}

Would you be interested in a brief conversation?

Best regards,
[Your Name]
<Body 1>

<Body 2>
Hello {{firstName}},

I came across {{company}} and was impressed by your work in the ${prompt.audience} space.

${prompt.product} has helped companies like yours ${prompt.objective.toLowerCase()} more effectively.

${prompt.cta}

Would this be relevant for {{company}}?

Thanks,
[Your Name]
<Body 2>

<Body 3>
Hi {{firstName}},

Quick question about {{company}}'s ${prompt.audience} operations.

We recently helped [Similar Company] achieve remarkable results with ${prompt.product}:
• 25% increase in productivity
• Streamlined workflows
• Better ROI

${prompt.cta}

Interested in learning more?

Best,
[Your Name]
<Body 3>

<Body 4>
Hello {{firstName}},

I hope this finds you well. I'm reaching out because ${prompt.product} might be valuable for {{company}}'s ${prompt.audience} team.

Our solution helps companies:
• ${prompt.objective}
• Improve efficiency
• Scale operations

${prompt.cta}

Would you have 15 minutes for a quick call?

Regards,
[Your Name]
<Body 4>

<Body 5>
Hi {{firstName}},

I noticed {{company}} is expanding in the ${prompt.audience} sector. Thought you might find ${prompt.product} interesting.

We've helped similar organizations:
• Achieve their goals faster
• Reduce costs by 20%
• Improve team performance

${prompt.cta}

Happy to share more details if relevant.

Best regards,
[Your Name]
<Body 5>

Generate compelling, high-converting cold emails that will get responses from ${prompt.audience} prospects.`

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