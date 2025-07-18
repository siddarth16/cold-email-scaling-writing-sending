export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  console.log('Test API called with method:', req.method)
  console.log('Test API headers:', req.headers)
  
  res.status(200).json({ 
    success: true, 
    message: 'Test API endpoint working!',
    method: req.method,
    timestamp: new Date().toISOString()
  })
} 