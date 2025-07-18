import { VercelRequest, VercelResponse } from '@vercel/node'

export interface EmailPrompt {
  product: string
  audience: string
  objective: string
  tone: string
  cta: string
  length: string
  template: string
}

export interface GeminiResponse {
  subjects: string[]
  bodies: string[]
  error?: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const prompt: EmailPrompt = req.body

    // Validate required fields
    if (!prompt.product || !prompt.audience || !prompt.objective || !prompt.cta) {
      return res.status(400).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Missing required fields: product, audience, objective, and cta are required' 
      })
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'AI API key not configured' 
      })
    }

    // Create comprehensive prompt for Gemini
    const geminiPrompt = createGeminiPrompt(prompt)

    // Call Gemini API
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

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      
      // Check for rate limit errors
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
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Invalid response from Gemini API' 
      })
    }

    const generatedText = data.candidates[0].content.parts[0].text
    
    // Parse the structured response
    const parsed = parseGeminiResponse(generatedText)
    
    if (parsed.subjects.length === 0 || parsed.bodies.length === 0) {
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Failed to parse AI response format' 
      })
    }

    return res.status(200).json(parsed)

  } catch (error) {
    console.error('Email generation error:', error)
    return res.status(500).json({ 
      subjects: [], 
      bodies: [], 
      error: 'Internal server error' 
    })
  }
}

function createGeminiPrompt(prompt: EmailPrompt): string {
  const lengthGuide = {
    short: '50-100 words',
    medium: '100-150 words', 
    long: '150-200 words'
  }

  const toneDescriptions = {
    professional: 'formal, business-focused, respectful',
    friendly: 'warm, approachable, conversational', 
    casual: 'relaxed, informal, personable',
    persuasive: 'compelling, action-oriented, convincing',
    consultative: 'advisory, helpful, expert-focused'
  }

  return `You are an expert cold email copywriter. Generate 5 different subject line options and 5 different email body options for a cold email campaign.

CAMPAIGN DETAILS:
- Product/Service: ${prompt.product}
- Target Audience: ${prompt.audience}
- Objective: ${prompt.objective}
- Tone: ${prompt.tone} (${toneDescriptions[prompt.tone as keyof typeof toneDescriptions] || 'professional'})
- Call to Action: ${prompt.cta}
- Email Length: ${prompt.length} (${lengthGuide[prompt.length as keyof typeof lengthGuide]})
- Template Type: ${prompt.template}

REQUIREMENTS:
1. Each subject line should be unique and attention-grabbing
2. Each email body should be complete and ready to send
3. Include personalization tokens like {{firstName}}, {{company}}, {{position}} where appropriate
4. Vary the approach across the 5 options (different hooks, value propositions, styles)
5. All emails should be ${lengthGuide[prompt.length as keyof typeof lengthGuide]} in length
6. Match the ${prompt.tone} tone consistently
7. Include the specified call to action: ${prompt.cta}

STRICT OUTPUT FORMAT - YOU MUST FOLLOW THIS EXACTLY:

<Subject> Option 1; Option 2; Option 3; Option 4; Option 5 <Subject>

<Body 1>
[First complete email body here]
<Body 1>

<Body 2>
[Second complete email body here]  
<Body 2>

<Body 3>
[Third complete email body here]
<Body 3>

<Body 4>
[Fourth complete email body here]
<Body 4>

<Body 5>
[Fifth complete email body here]
<Body 5>

Generate compelling, high-converting cold emails that will get responses from ${prompt.audience} prospects.`
}

function parseGeminiResponse(text: string): GeminiResponse {
  try {
    // Extract subjects
    const subjectMatch = text.match(/<Subject>\s*(.*?)\s*<Subject>/s)
    if (!subjectMatch) {
      return { subjects: [], bodies: [], error: 'No subjects found in response' }
    }
    
    const subjects = subjectMatch[1]
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 5) // Ensure max 5 subjects

    // Extract bodies
    const bodies: string[] = []
    for (let i = 1; i <= 5; i++) {
      const bodyRegex = new RegExp(`<Body ${i}>\\s*(.*?)\\s*<Body ${i}>`, 's')
      const bodyMatch = text.match(bodyRegex)
      if (bodyMatch) {
        bodies.push(bodyMatch[1].trim())
      }
    }

    if (subjects.length < 5 || bodies.length < 5) {
      return { 
        subjects: [], 
        bodies: [], 
        error: `Incomplete response: ${subjects.length} subjects, ${bodies.length} bodies` 
      }
    }

    return { subjects, bodies }
  } catch (error) {
    return { subjects: [], bodies: [], error: 'Failed to parse response format' }
  }
} 