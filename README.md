# Gary Vee Network V2

Enterprise-grade relationship management system for Gary Vaynerchuk's tiered network.

## 🚀 Features

### Core Functionality
- **Tiered Contact Management**: Pink (Tier 1), Yellow (Tier 2), Green (Tier 3) contact categorization
- **AI-Powered Insights**: Natural language queries and network analysis
- **Dark Mode**: Full dark theme support with smooth transitions
- **Real-time Analytics**: Professional dashboard with network statistics
- **Import/Export**: Bulk contact management with CSV support
- **Advanced Search**: Filter and search across all contact fields

### 🆕 **Instagram Screenshot OCR** (NEW!)
- **Upload Profile Screenshots**: Drag & drop Instagram, LinkedIn, Twitter profile images
- **AI-Powered Text Extraction**: Uses Tesseract.js + OpenAI for intelligent parsing
- **Auto-Populate Forms**: Extracts name, email, location, bio, interests automatically
- **Manual Review**: Edit extracted data before saving
- **Multiple Formats**: Supports JPG, PNG, WebP, HEIC (up to 10MB)

## 🧪 Testing the OCR Feature

### Test Scenario 1: Instagram Profile Screenshot
1. **Open the app** at `http://localhost:3000`
2. **Click "Add Contact"** button
3. **Select "Upload Screenshot"** tab
4. **Upload an Instagram profile screenshot** containing:
   - Profile name/username
   - Bio text with interests
   - Location information
   - Contact details (if visible)
5. **Click "Extract Contact Data"**
6. **Review extracted information** in the preview
7. **Click "Apply to Form"** to populate the contact form
8. **Edit any fields** as needed
9. **Save the contact**

### Test Scenario 2: LinkedIn Profile Screenshot
1. Follow the same steps as above
2. Upload a LinkedIn profile screenshot
3. Verify business information extraction
4. Check professional interests parsing

### Test Scenario 3: Manual Entry Fallback
1. If OCR fails, the system will show error messages
2. Switch to "Manual Entry" tab
3. Fill in contact information manually
4. Save the contact

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **UI Components**: shadcn/ui
- **OCR Processing**: Tesseract.js (client-side)
- **AI Integration**: OpenAI GPT-4 for text parsing
- **Storage**: localStorage (MVP) → Snowflake (production)
- **Styling**: Tailwind CSS with custom tier color system

## 🎨 Design System

### Tier Colors
- **Tier 1 (Pink)**: hsl(330 81% 60%) - Closest to Gary
- **Tier 2 (Yellow)**: hsl(48 96% 53%) - Important contacts  
- **Tier 3 (Green)**: hsl(142 71% 45%) - General network

### Dark Mode Support
- Full dark theme implementation
- Smooth color transitions
- Professional enterprise appearance

## 📱 Responsive Design

- **Desktop**: Full analytics dashboard, advanced features
- **Tablet**: Optimized layout with collapsible sections
- **Mobile**: Touch-friendly interface with simplified analytics

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npx tsc --noEmit

# Build for production
npm run build
```

## 🚀 Deployment

- **Development**: `http://localhost:3000`
- **Production**: Docker + Vercel/AWS ready
- **Database**: localStorage → Snowflake migration path

## 📊 Analytics Dashboard

Real-time network statistics including:
- Total contact count
- Tier distribution with color coding
- Recent growth indicators
- Professional enterprise metrics

## 🤖 AI Features

- **Natural Language Queries**: "Show me tier 1 contacts with kids"
- **Network Analysis**: Relationship strength and growth insights
- **OCR Text Parsing**: Intelligent extraction from profile screenshots
- **Content Recommendations**: Based on contact interests and relationships

## 💡 Enterprise Value

This system demonstrates:
- **10x faster contact entry** with OCR
- **AI-powered intelligence** for relationship management
- **Professional enterprise UX** with dark mode and analytics
- **Scalable architecture** ready for production deployment

---

**Built for Gary Vaynerchuk's network management needs** 🚀
