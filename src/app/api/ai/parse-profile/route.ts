import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ExtractedData } from '@/lib/ocr'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, task } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    const prompt = `
You are an expert at extracting contact information from social media profile text. 
Analyze the following text and extract structured contact information.

Text to analyze:
${text}

Please extract and categorize the following information:
1. Name (full name or display name)
2. Email address (if present)
3. Phone number (if present)
4. Location (city, state, country)
5. Bio/description (professional summary or personal description)
6. Website (if present)
7. Business information (company, role, industry)
8. Interests (hobbies, passions, professional interests)

Return the data in this exact JSON format:
{
  "name": "extracted name or null",
  "email": "extracted email or null", 
  "phone": "extracted phone or null",
  "location": "extracted location or null",
  "bio": "extracted bio text or null",
  "website": "extracted website or null",
  "businessInfo": "extracted business info or null",
  "interests": ["interest1", "interest2", "interest3"]
}

Only include fields that are actually present in the text. If a field is not found, use null.
For interests, extract relevant keywords and phrases that indicate hobbies, passions, or professional interests.
Keep the bio concise but informative.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional contact information extraction assistant. Extract only the information that is explicitly present in the provided text. Be accurate and precise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let parsedData: ExtractedData
    try {
      parsedData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid response format from AI')
    }

    // Ensure all required fields are present
    const structuredData: ExtractedData = {
      name: parsedData.name || undefined,
      email: parsedData.email || undefined,
      phone: parsedData.phone || undefined,
      location: parsedData.location || undefined,
      bio: parsedData.bio || undefined,
      website: parsedData.website || undefined,
      businessInfo: parsedData.businessInfo || undefined,
      interests: Array.isArray(parsedData.interests) ? parsedData.interests : [],
      rawText: text
    }

    return NextResponse.json({
      success: true,
      parsedData: structuredData,
      confidence: 'high'
    })

  } catch (error) {
    console.error('Profile parsing error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to parse profile data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 