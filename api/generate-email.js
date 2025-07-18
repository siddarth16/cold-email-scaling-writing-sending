export default function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ subjects: [], bodies: [], error: 'Method not allowed' })
  }

  // Return mock data for now to test if endpoint works
  const mockSubjects = [
    "Quick question about your CRM needs",
    "Helping small businesses like yours scale", 
    "15-minute demo that could save you hours",
    "Transform your customer management today",
    "Your competitors are already using this"
  ]

  const mockBodies = [
    "Hi {{firstName}},\n\nI noticed {{company}} might benefit from our CRM software. We help small business owners like you streamline customer management.\n\nBook a 15 minute call\n\nWould you be open to a quick demo?\n\nBest regards,\n[Your Name]",
    "Hello {{firstName}},\n\nI came across {{company}} and thought you might be interested in how we help small business owners schedule demos more effectively.\n\nBook a 15 minute call\n\nHappy to show you how it works.\n\nThanks,\n[Your Name]", 
    "Hi {{firstName}},\n\nQuick question about {{company}}'s customer management. We recently helped a similar business improve their workflow significantly.\n\nBook a 15 minute call\n\nInterested in learning more?\n\nBest,\n[Your Name]",
    "Hello {{firstName}},\n\nI hope this finds you well. I'm reaching out because our CRM software might be valuable for {{company}}.\n\nBook a 15 minute call\n\nWould you have 15 minutes for a quick call?\n\nRegards,\n[Your Name]",
    "Hi {{firstName}},\n\nI noticed {{company}} is growing and thought you might find our CRM solution interesting for small business owners.\n\nBook a 15 minute call\n\nHappy to share more details if relevant.\n\nBest regards,\n[Your Name]"
  ]

  return res.status(200).json({ subjects: mockSubjects, bodies: mockBodies })
} 