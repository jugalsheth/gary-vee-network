Option A: Cursor's Built-in Analysis
bash# In Cursor terminal, run:
find src -name "*.tsx" -o -name "*.ts" -o -name "*.json" | head -20 | xargs wc -l
tree src/ -I node_modules
Option B: Complete Codebase Export for Claude
Create a prompt for Cursor:
Generate a complete codebase analysis for Claude handoff:

Create a comprehensive analysis including:
1. Complete file structure with all components
2. All TypeScript interfaces and types
3. Key functions and their purposes
4. Component relationships and data flow
5. API routes and their functionality
6. Current state of all features
7. Dependencies and their usage
8. Environment variables and configuration

Format this as a detailed technical summary that another Claude instance can use to understand the entire codebase and continue development seamlessly.

Include actual code snippets for critical components and explain the architecture decisions.
Option C: Export Key Files
In Cursor, create a "codebase-summary.md" with:

All component files' main structure
API routes and logic
Type definitions
Key utility functions