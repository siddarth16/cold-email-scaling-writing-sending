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
    if (!prompt?.companyName || !prompt?.product || !prompt?.audience || !prompt?.objective || !prompt?.cta) {
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
- Company/Sender: ${prompt.companyName}
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
4. Include the sender company name "${prompt.companyName}" naturally in the emails when relevant
5. Match the ${prompt.tone} tone throughout
6. Include the call to action: ${prompt.cta}
7. Make emails approximately ${prompt.length} length
8. Each email should feel authentic and personal, not templated

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
    console.log('Full generated text:', generatedText)
    
    // Much more robust parsing that preserves content
    let subjects = []
    let bodies = []
    
    // Enhanced subject parsing - multiple methods
    console.log('=== PARSING SUBJECTS ===')
    
    // Method 1: Standard XML-like format
    const subjectMatch = generatedText.match(/<Subject>\s*(.*?)\s*(?:<\/?\s*Subject>|$)/s)
    if (subjectMatch) {
      console.log('Found subject match:', subjectMatch[1])
      subjects = subjectMatch[1]
        .split(/[;\n]/) // Split by semicolon OR newline
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.toLowerCase().includes('<subject'))
        .slice(0, 5)
    }
    
    // Method 2: Look for "Subject:" patterns
    if (subjects.length === 0) {
      console.log('Trying subject: pattern...')
      const subjectLines = generatedText.match(/subject\s*\d*\s*:?\s*(.+?)(?:\n|$)/gi)
      if (subjectLines) {
        subjects = subjectLines
          .map(line => line.replace(/subject\s*\d*\s*:?\s*/i, '').trim())
          .filter(s => s.length > 0)
          .slice(0, 5)
      }
    }
    
    // Method 3: Look for numbered/bulleted lists
    if (subjects.length === 0) {
      console.log('Trying numbered list parsing for subjects...')
      const lines = generatedText.split('\n')
      subjects = lines
        .filter(line => {
          const trimmed = line.trim()
          return trimmed.match(/^(\d+[\.\)]\s*|[\*\-•]\s*)/i) && 
                 trimmed.length > 5 && 
                 trimmed.length < 100 // Likely a subject line
        })
        .map(line => line.replace(/^(\d+[\.\)]\s*|[\*\-•]\s*)/, '').trim())
        .slice(0, 5)
    }

    console.log('Final subjects found:', subjects.length, subjects)

    // Enhanced body parsing - much more lenient
    console.log('=== PARSING BODIES ===')
    
    // Method 1: Standard XML-like format with non-greedy matching
    for (let i = 1; i <= 5; i++) {
      // Try multiple variations of body tags
      const patterns = [
        `<Body ${i}>([\\s\\S]*?)(?:<\/?\\s*Body ${i}>|<Body ${i+1}>|$)`,
        `<Body${i}>([\\s\\S]*?)(?:<\/?\\s*Body${i}>|<Body${i+1}>|$)`,
        `Body ${i}[:\\-\\s]*([\\s\\S]*?)(?:Body ${i+1}|<Body|$)`
      ]
      
      for (const pattern of patterns) {
        const bodyMatch = generatedText.match(new RegExp(pattern, 's'))
        if (bodyMatch && bodyMatch[1].trim().length > 20) {
          let bodyContent = bodyMatch[1].trim()
          // Clean up any remaining tags
          bodyContent = bodyContent.replace(/<\/?Body\s*\d*>/gi, '').trim()
          if (bodyContent.length > 20) {
            bodies.push(bodyContent)
            console.log(`Found body ${i} with pattern ${pattern}:`, bodyContent.substring(0, 100) + '...')
            break
          }
        }
      }
    }
    
    // Method 2: Split by clear email separators
    if (bodies.length === 0) {
      console.log('Trying email separator parsing...')
      const separators = [
        /(?:Email|Option|Version)\s*\d+[:\-\s]*/gi,
        /\n\s*\d+[\.\)]\s*(?=\w)/g,
        /\n\s*[\*\-]\s*(?=\w)/g
      ]
      
      for (const separator of separators) {
        const sections = generatedText.split(separator)
        if (sections.length > 2) { // At least some splits occurred
          bodies = sections
            .slice(1) // Skip first part (usually instructions)
            .map(section => section.trim())
            .filter(section => section.length > 30) // More lenient length check
            .slice(0, 5)
          
          if (bodies.length > 0) {
            console.log(`Found ${bodies.length} bodies using separator parsing`)
            break
          }
        }
      }
    }
    
    // Method 3: Smart paragraph detection
    if (bodies.length === 0) {
      console.log('Trying smart paragraph detection...')
      const paragraphs = generatedText
        .split(/\n\s*\n+/) // Split by double+ newlines
        .map(p => p.trim())
        .filter(p => {
          // More intelligent filtering
          return p.length > 30 && 
                 !p.toLowerCase().includes('subject') &&
                 !p.toLowerCase().includes('output format') &&
                 !p.toLowerCase().includes('requirements') &&
                 (p.includes('{{') || p.includes('Hi ') || p.includes('Hello ') || p.includes('Dear '))
        })
        .slice(0, 5)
      
      if (paragraphs.length > 0) {
        bodies = paragraphs
        console.log(`Found ${bodies.length} bodies using paragraph detection`)
      }
    }

    console.log('Final bodies found:', bodies.length)
    bodies.forEach((body, i) => {
      console.log(`Body ${i+1} (${body.length} chars):`, body.substring(0, 150) + '...')
    })
    
    // Ensure we have at least some content
    if (subjects.length === 0) {
      subjects = ['Quick question about {{company}}', 'Partnership opportunity', 'Brief chat?', 'Collaboration idea', 'Quick favor']
    }
    
    if (bodies.length === 0) {
      bodies = [
        `Hi {{firstName}},\n\nI'm reaching out from ${prompt.companyName}. I noticed {{company}} and thought you might be interested in ${prompt.product}. ${prompt.cta}?\n\nBest regards`,
        `Hello {{firstName}},\n\nQuick question about {{company}}'s goals with ${prompt.audience}. I'm with ${prompt.companyName} and we help companies like yours. ${prompt.cta}?\n\nThanks`,
        `Hi {{firstName}},\n\nI'm from ${prompt.companyName} and help ${prompt.audience} with ${prompt.objective}. Worth a brief chat?\n\nBest`,
        `Hello {{firstName}},\n\nSaw {{company}} online and thought of our ${prompt.product} at ${prompt.companyName}. ${prompt.cta}?\n\nCheers`,
        `Hi {{firstName}},\n\nOur ${prompt.product} at ${prompt.companyName} has helped similar companies. Quick chat about {{company}}?\n\nBest regards`
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