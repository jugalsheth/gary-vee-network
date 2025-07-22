# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Database Operations
- Uses Snowflake as the primary database with JWT authentication
- Connection details configured via environment variables
- Database schema: `gary_vee_contacts` table with contact data
- Voice notes and complex data stored as JSON/VARIANT fields

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Database**: Snowflake with JWT authentication
- **AI Integration**: OpenAI GPT-4 for profile parsing and chat
- **OCR**: Tesseract.js for image text extraction
- **File Processing**: Papa Parse for CSV import/export
- **Search**: Fuse.js for fuzzy search
- **Audio**: Voice notes with transcription support

### Key Architecture Patterns

#### Data Storage Architecture
- **Primary Storage**: Snowflake database for production contact data
- **Type System**: Centralized in `src/lib/types.ts` with Contact interface
- **Storage Layer**: `src/lib/storage.ts` handles all database operations
- **Tier System**: 3-tier contact classification (Pink/Tier1, Yellow/Tier2, Green/Tier3)

#### Component Architecture
- **Modular Design**: Each feature has dedicated components in `src/components/`
- **Modal Pattern**: Consistent modal structure for Add/Edit/Delete operations
- **Bulk Operations**: Dedicated component for mass contact management
- **Network Visualization**: D3.js-based relationship mapping

#### API Routes
- **RESTful Design**: CRUD operations in `src/app/api/contacts/`
- **AI Integration**: Separate routes for AI chat and profile parsing
- **Authentication**: JWT-based auth with team-based access control

### Contact Management System

#### Contact Types & Tiers
- **Contact Types**: business, influencer, general
- **Tier System**: tier1 (closest), tier2 (important), tier3 (general network)
- **Metadata**: Relationships, connections, voice notes, and interests

#### OCR & AI Features
- **Screenshot Processing**: Upload profile screenshots for auto-extraction
- **AI Parsing**: OpenAI integration for intelligent data extraction
- **Manual Fallback**: Form-based entry when OCR fails

### Data Flow
1. **Frontend State**: React state management with real-time updates
2. **API Layer**: Next.js API routes handle business logic
3. **Storage Layer**: Snowflake database with connection pooling
4. **External APIs**: OpenAI for AI features, Tesseract for OCR

### Environment Configuration
Required environment variables:
- `SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USERNAME`, `SNOWFLAKE_ROLE`
- `SNOWFLAKE_WAREHOUSE`, `SNOWFLAKE_DATABASE`, `SNOWFLAKE_SCHEMA`
- `PRIVATE_KEY_PATH` for JWT authentication
- `OPENAI_API_KEY` for AI features

### Development Notes
- **Authentication**: Team-based access with TeamG, TeamA, TeamC classification
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Dark Mode**: Full theme support with smooth transitions
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Performance**: Pagination, skeleton loading, and optimized queries

### Testing Approach
- Use the OCR demo feature to test profile screenshot extraction
- Voice notes demo available for testing audio features
- Import/Export functionality supports CSV format
- Network visualization provides relationship insights