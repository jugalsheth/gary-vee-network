export interface ExtractedData {
  name?: string
  email?: string
  phone?: string
  location?: string
  bio?: string
  website?: string
  businessInfo?: string
  interests?: string[]
  rawText: string
}

export interface OCRResult {
  success: boolean
  data?: ExtractedData
  error?: string
  confidence?: number
}

export async function extractTextFromImage(imageFile: File): Promise<OCRResult> {
  try {
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(imageFile)
    // Use Tesseract.js to extract text (lazy load)
    const { default: Tesseract } = await import('tesseract.js');
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: m => console.log('OCR Progress:', m)
      }
    )

    // Clean up the URL
    URL.revokeObjectURL(imageUrl)

    if (!result.data.text) {
      return {
        success: false,
        error: 'No text could be extracted from the image'
      }
    }

    const rawText = result.data.text.trim()
    const confidence = result.data.confidence

    // Use OpenAI to intelligently parse the extracted text
    const parsedData = await parseExtractedText(rawText)

    return {
      success: true,
      data: {
        ...parsedData,
        rawText
      },
      confidence
    }
  } catch (error) {
    console.error('OCR Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    }
  }
}

async function parseExtractedText(text: string): Promise<ExtractedData> {
  try {
    const response = await fetch('/api/ai/parse-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        task: 'Extract contact information from social media profile text'
      })
    })

    if (!response.ok) {
      throw new Error('Failed to parse text with AI')
    }

    const data = await response.json()
    return data.parsedData
  } catch (error) {
    console.error('AI Parsing Error:', error)
    // Fallback to basic parsing if AI fails
    return basicTextParsing(text)
  }
}

function basicTextParsing(text: string): ExtractedData {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  
  const extracted: ExtractedData = {
    rawText: text
  }

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const emailMatch = text.match(emailRegex)
  if (emailMatch) {
    extracted.email = emailMatch[0]
  }

  // Extract phone
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/
  const phoneMatch = text.match(phoneRegex)
  if (phoneMatch) {
    extracted.phone = phoneMatch[0]
  }

  // Extract website
  const websiteRegex = /(https?:\/\/[^\s]+)/
  const websiteMatch = text.match(websiteRegex)
  if (websiteMatch) {
    extracted.website = websiteMatch[0]
  }

  // Basic name extraction (first line that looks like a name)
  for (const line of lines) {
    if (line.length > 2 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
      // Check if it looks like a name (contains letters, not just numbers/symbols)
      if (/[a-zA-Z]/.test(line) && !/^\d+$/.test(line)) {
        extracted.name = line
        break
      }
    }
  }

  // Extract location (look for common location patterns)
  const locationPatterns = [
    /([A-Z][a-z]+,\s*[A-Z]{2})/, // City, State
    /([A-Z][a-z]+,\s*[A-Z][a-z]+)/, // City, Country
    /([A-Z][a-z]+\s*[A-Z]{2})/ // City State
  ]

  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match) {
      extracted.location = match[0]
      break
    }
  }

  // Use remaining text as bio
  const usedText = [
    extracted.name,
    extracted.email,
    extracted.phone,
    extracted.website,
    extracted.location
  ].filter(Boolean).join(' ')

  const remainingText = text.replace(usedText, '').trim()
  if (remainingText.length > 10) {
    extracted.bio = remainingText.substring(0, 500) // Limit bio length
  }

  return extracted
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid image file (JPG, PNG, WebP, HEIC)' }
  }

  return { valid: true }
} 