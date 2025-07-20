import { NextRequest } from 'next/server'
import { OpenAI } from 'openai'
import type { Contact } from '@/lib/types'

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not configured in environment variables')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Fallback pattern matching function
function fallbackQuery(query: string, contacts: Contact[]): { response: string, matchedContacts: Contact[] } {
  const q = query.toLowerCase()
  let filtered: Contact[] = contacts
  let response = ''

  if (/tier 1/.test(q)) {
    filtered = filtered.filter(c => c.tier === 'tier1')
    response = 'Here are your Tier 1 contacts:'
  } else if (/tier 2/.test(q)) {
    filtered = filtered.filter(c => c.tier === 'tier2')
    response = 'Here are your Tier 2 contacts:'
  } else if (/tier 3/.test(q)) {
    filtered = filtered.filter(c => c.tier === 'tier3')
    response = 'Here are your Tier 3 contacts:'
  }

  if (/with kids/.test(q) || /has kids/.test(q)) {
    filtered = filtered.filter(c => c.hasKids)
    response = response ? response + ' with kids:' : 'Here are contacts with kids:'
  }
  if (/married/.test(q)) {
    filtered = filtered.filter(c => c.isMarried)
    response = response ? response + ' who are married:' : 'Here are married contacts:'
  }
  if (/workout/.test(q) || /exercise/.test(q) || /running/.test(q)) {
    filtered = filtered.filter(c => (c.interests || []).some(i => /workout|exercise|running|fitness|gym/i.test(i)))
    response = response ? response + ' who love working out:' : 'Here are contacts who love working out:'
  }
  const locationMatch = q.match(/in ([a-zA-Z ]+)/)
  if (locationMatch) {
    const loc = locationMatch[1].trim().toLowerCase()
    filtered = filtered.filter(c => c.location && c.location.toLowerCase().includes(loc))
    response = response ? response + ` in ${locationMatch[1]}:` : `Here are contacts in ${locationMatch[1]}:`
  }
  if (!response) response = 'Here are your contacts:'
  if (filtered.length === 0) response = "Sorry, I couldn't find any contacts matching your query."
  return { response, matchedContacts: filtered }
}

export async function POST(req: NextRequest) {
  try {
    const { query, contacts } = await req.json() as { query: string, contacts: Contact[] }
    if (!query || !contacts) {
      return Response.json({ error: 'Missing query or contacts' }, { status: 400 })
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI not configured, using fallback pattern matching')
      const fallback = fallbackQuery(query, contacts)
      return Response.json(fallback)
    }

    // Prepare context for GPT
    const systemPrompt = `You are an expert, proactive relationship assistant for Gary Vaynerchuk. You have access to a list of contacts with detailed info. 

Your role is to be AGENTIC and PROACTIVE:
1. Answer user queries conversationally and intelligently
2. Provide proactive insights and suggestions
3. Analyze relationship patterns and opportunities
4. Suggest specific actions and follow-ups
5. Recommend content ideas based on contact interests
6. Identify network gaps and growth opportunities

When responding:
- Be conversational and engaging
- Provide actionable insights
- Suggest specific next steps
- Analyze patterns in the data
- Recommend optimal timing for outreach
- Identify partnership opportunities

If contacts match the query, return a JSON array of matching contact IDs as 'matches'. If no contacts match, say so but still provide insights.

Format your response naturally, and if you have matches, include them as: "matches": ["id1", "id2"]`
    const contactContext = contacts.map(c => `ID: ${c.id}, Name: ${c.name}, Tier: ${c.tier}, Email: ${c.email ?? ''}, Phone: ${c.phone ?? ''}, Relationship: ${c.relationshipToGary}, Has Kids: ${c.hasKids}, Is Married: ${c.isMarried}, Location: ${c.location ?? ''}, Interests: ${(c.interests || []).join(', ')}, Notes: ${c.notes || ''}`).join('\n')
    const userPrompt = `Contacts:\n${contactContext}\n\nUser Query: ${query}\n\nRespond conversationally with insights and include matching contact IDs as JSON if applicable.`

    console.log('Sending request to OpenAI:', { query, contactCount: contacts.length })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 600,
    })

    const aiText = completion.choices[0]?.message?.content || ''
    console.log('OpenAI response:', aiText)
    
    // Extract JSON array of matches from the response
    const matchRegex = /"matches"\s*:\s*(\[[^\]]*\])/i
    const match = aiText.match(matchRegex)
    let matchedContacts: Contact[] = []
    if (match) {
      try {
        const ids: string[] = JSON.parse(match[1])
        matchedContacts = contacts.filter(c => ids.includes(c.id))
      } catch (parseError) {
        console.error('Failed to parse matches from OpenAI response:', parseError)
      }
    }
    return Response.json({ response: aiText, matchedContacts })
  } catch (error) {
    console.error('AI chat error:', error)
    
    // Try fallback if OpenAI fails
    try {
      const { query, contacts } = await req.json() as { query: string, contacts: Contact[] }
      console.log('OpenAI failed, using fallback pattern matching')
      const fallback = fallbackQuery(query, contacts)
      return Response.json(fallback)
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      return Response.json({ 
        error: 'AI chat failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        response: 'Sorry, there was an error processing your request. Please try again.',
        matchedContacts: []
      }, { status: 500 })
    }
  }
} 