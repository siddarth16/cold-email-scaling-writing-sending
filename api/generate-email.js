export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ subjects: [], bodies: [], error: 'Method not allowed' })
  }

  try {
    const prompt = req.body
    console.log('Received prompt:', prompt)

    // Validate required fields
    if (!prompt?.product || !prompt?.audience || !prompt?.objective || !prompt?.cta) {
      return res.status(400).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Missing required fields' 
      })
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'AI API key not configured' 
      })
    }

    // Create prompt for Gemini
    const geminiPrompt = `You are an expert cold email copywriter. Generate 5 unique subject line options and 5 unique email body options for a cold email campaign.

CAMPAIGN DETAILS:
- Product/Service: ${prompt.product}
- Target Audience: ${prompt.audience}
- Objective: ${prompt.objective}
- Tone: ${prompt.tone}
- Call to Action: ${prompt.cta}
- Email Length: ${prompt.length}

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
    
    // Call Gemini API  
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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

    console.log('Gemini response status:', response.status)

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ 
          subjects: [], 
          bodies: [], 
          error: 'Limit reached, try after 2 minutes' 
        })
      }
      
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: `API error: ${response.status}` 
      })
    }

    const data = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ 
        subjects: [], 
        bodies: [], 
        error: 'Invalid response from AI' 
      })
    }

    const generatedText = data.candidates[0].content.parts[0].text
    console.log('Generated text length:', generatedText.length)
    console.log('Generated text preview:', generatedText.substring(0, 500) + '...')
    
    // More robust parsing with multiple fallback methods
    let subjects = []
    let bodies = []
    
    // Method 1: Try standard format
    const subjectMatch = generatedText.match(/<Subject>\s*(.*?)\s*<\/?\s*Subject>/s)
    if (subjectMatch) {
      subjects = subjectMatch[1]
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .slice(0, 5)
    }
    
    // Method 2: Fallback for subjects - look for numbered lists or bullet points
    if (subjects.length === 0) {
      console.log('Trying fallback subject parsing...')
      const subjectLines = generatedText.split('\n')
        .filter(line => 
          line.trim().match(/^(\d+\.|\*|\-|•)\s*.+/) || 
          line.trim().toLowerCase().includes('subject')
        )
        .slice(0, 5)
        .map(line => line.replace(/^(\d+\.|\*|\-|•)\s*/, '').trim())
        .filter(line => line.length > 0)
      
      if (subjectLines.length > 0) {
        subjects = subjectLines
      }
    }

    // Method 1: Try standard body format
    for (let i = 1; i <= 5; i++) {
      const bodyRegex = new RegExp(`<Body ${i}>\\s*(.*?)\\s*<\/?\\s*Body ${i}>`, 's')
      const bodyMatch = generatedText.match(bodyRegex)
      if (bodyMatch) {
        bodies.push(bodyMatch[1].trim())
      }
    }
    
    // Method 2: Fallback for bodies - split by common patterns
    if (bodies.length === 0) {
      console.log('Trying fallback body parsing...')
      
      // Try to split by email patterns or body markers
      const emailSections = generatedText
        .split(/(?:Email\s*\d+|Body\s*\d+|Option\s*\d+)/i)
        .slice(1) // Remove first empty part
        .map(section => section.trim())
        .filter(section => section.length > 50) // Filter out too short sections
        .slice(0, 5)
      
      if (emailSections.length > 0) {
        bodies = emailSections
      } else {
        // Last resort: split by double newlines and take longer sections
        const paragraphs = generatedText
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(p => p.length > 100) // Only longer paragraphs
          .slice(0, 5)
        
        if (paragraphs.length > 0) {
          bodies = paragraphs
        }
      }
    }

    console.log('Parsed results:', { 
      subjects: subjects.length, 
      bodies: bodies.length,
      subjectSample: subjects[0] ? subjects[0].substring(0, 50) + '...' : 'none',
      bodySample: bodies[0] ? bodies[0].substring(0, 100) + '...' : 'none'
    })
    
    // Ensure we have at least some content
    if (subjects.length === 0) {
      subjects = ['Quick question about {{company}}', 'Partnership opportunity', 'Brief chat?', 'Collaboration idea', 'Quick favor']
    }
    
    if (bodies.length === 0) {
      bodies = [
        `Hi {{firstName}},\n\nI noticed {{company}} and thought you might be interested in ${prompt.product}. ${prompt.cta}?\n\nBest regards`,
        `Hello {{firstName}},\n\nQuick question about {{company}}'s goals with ${prompt.audience}. ${prompt.cta}?\n\nThanks`,
        `Hi {{firstName}},\n\nI help ${prompt.audience} with ${prompt.objective}. Worth a brief chat?\n\nBest`,
        `Hello {{firstName}},\n\nSaw {{company}} online and thought of ${prompt.product}. ${prompt.cta}?\n\nCheers`,
        `Hi {{firstName}},\n\n${prompt.product} has helped similar companies. Quick chat about {{company}}?\n\nBest regards`
      ]
    }

    return res.status(200).json({ subjects, bodies })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ 
      subjects: [], 
      bodies: [], 
      error: 'Internal server error' 
    })
  }
} 