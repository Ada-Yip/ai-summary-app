# Document Summary App - Architecture & Development Guide

## Project Overview

The Document Summary App is a Next.js application that enables users to upload documents (TXT and PDF), generate AI-powered summaries using Groq AI, edit summaries, and manage their documents. All data is securely stored in Supabase cloud storage.

## Application Architecture

### Frontend (Client-Side)

```
app/
├── page.tsx                 # Main dashboard with document list and upload
├── layout.tsx               # Root layout with global styling
├── globals.css              # Global styles
├── documents/
│   ├── layout.tsx           # Documents section layout with navigation
│   ├── [name]/              # Dynamic route for documents
│   │   ├── page.tsx         # Document viewer (displays content)
│   │   ├── summary.tsx      # Old component (not used - keep for reference)
│   │   └── summary/
│   │       └── page.tsx     # Summary generator and editor
```

### Backend (API Routes)

```
api/
├── health/
│   └── route.ts             # Health check endpoint
├── documents/
│   ├── route.ts             # Legacy documents table endpoint (unused)
│   ├── list/
│   │   └── route.ts         # GET - List files in Document bucket
│   ├── upload/
│   │   └── route.ts         # POST - Upload file to Document bucket
│   ├── delete/
│   │   └── route.ts         # POST - Delete document and summary
│   ├── get-url/
│   │   └── route.ts         # POST - Get public URL for file
│   └── extract-text/
│       └── route.ts         # POST - Extract text from PDF
└── summary/
    ├── generate/
    │   └── route.ts         # POST - Generate summary using Groq AI
    ├── update/
    │   └── route.ts         # POST - Update/save edited summary
    └── get/
        └── route.ts         # POST - Get existing summary
```

### External Services

```
┌─────────────────┐
│   Supabase      │
├─────────────────┤
│  Document Bucket│ ← Store uploaded files
│  Summary Bucket │ ← Store generated summaries
└─────────────────┘

┌─────────────────┐
├─────────────────┤
│  GPT-3.5-turbo  │ ← Generate summaries
└─────────────────┘
```

## Data Flow

### Document Upload Flow
```
Frontend Form Input
    ↓
/api/documents/upload (POST)
    ↓
Validate file type & size
    ↓
Upload to Supabase Document bucket
    ↓
Return path to frontend
    ↓
Update documents list
```

### Document View Flow
```
User clicks "View"
    ↓
Check file extension
    ↓
If PDF:
  /api/documents/extract-text (POST)
      ↓
  Fetch PDF from Supabase
  Extract text using pdf-parse
  Return text
Else (TXT):
  /api/documents/get-url (POST)
      ↓
  Get Supabase public URL
      ↓
  Fetch text from URL
      ↓
Display in browser
```

### Summary Generation Flow
```
User enters requirement, selects language
    ↓
Click "Generate New Summary"
    ↓
Frontend fetches document text
    ↓
/api/summary/generate (POST)
    ↓
Build prompt with language and requirement
    ↓
Call Groq AI API
    ↓
Save summary to Supabase Summary bucket
    ↓
Return summary to frontend
    ↓
Display in "Current Summary" section
```

### Summary Edit Flow
```
User clicks "Edit Summary"
    ↓
Enable edit mode (textarea)
    ↓
User modifies text
    ↓
Click "Save Summary"
    ↓
/api/summary/update (POST)
    ↓
Upload updated summary to Supabase
    ↓
Confirm save success
    ↓
Display updated summary
```

### Document Deletion Flow
```
User clicks "Delete"
    ↓
Show confirmation dialog
    ↓
User confirms
    ↓
/api/documents/delete (POST)
    ↓
Delete from Document bucket
Delete associated summary from Summary bucket
    ↓
Return success
    ↓
Refresh document list
```

## Technology Decisions

### Why Next.js?
- Full-stack React framework with server-side capabilities
- Built-in API route handling (serverless functions)
- Automatic optimization (code splitting, image optimization)
- Great developer experience with hot reload

### Why Supabase?
- Open-source Firebase alternative
- Object storage for files (documents and summaries)
- Free tier generous for development
- Easy authentication if needed in future
- Reliable and scalable infrastructure

- State-of-the-art language models
- GPT-3.5-turbo offers good balance of cost and quality
- Easy-to-use API
- Well-documented

### Why TailwindCSS?
- Utility-first CSS framework
- Reduces CSS file size
- Fast development with pre-built components
- Responsive design built-in

## Key Features Implementation

### 1. Document Upload
- Accepts TXT and PDF files
- Max file size: 50MB
- Files stored in Supabase with unique names
- Validates file type on backend

### 2. PDF Text Extraction
- Uses `pdf-parse` library
- Extracts text from multi-page PDFs
- Handles formatting and special characters
- Graceful error handling for corrupted PDFs

### 3. AI Summary Generation
- Uses Groq AI
- Supports multiple output languages (English, Chinese, Japanese)
- Allows custom requirements in prompt
- Temperature set to 0.7 for balanced creativity
- Max tokens: 1000 per summary

### 4. Summary Management
- Summaries stored with document name as identifier
- Edit capability with save/cancel options
- Persistent storage in Supabase
- Load existing summary on page load

### 5. Document Management
- List all uploaded documents
- View document content
- Delete documents with confirmation
- Cascading delete (removes associated summary)

## State Management

The app uses React's built-in state management with `useState` and `useEffect` hooks:

### Main Page State
```typescript
- status: string (status message)
- uploading: boolean (upload progress)
- file: File | null (selected file)
- files: DocumentFile[] (list of documents)
- loadingFiles: boolean (loading state)
- deletingFile: string | null (file being deleted)
```

### Summary Page State
```typescript
- documentText: string (original document content)
- requirement: string (custom summary requirement)
- language: string (output language)
- summary: string (generated/current summary)
- existingSummary: string (previously saved summary)
- editing: boolean (edit mode toggle)
- editValue: string (edited summary text)
- loading: boolean (save progress)
- error: string (error message)
- generatingNew: boolean (generation progress)
```

## Error Handling Strategy

### Frontend Error Handling
- Display user-friendly error messages
- Status messages indicate success or failure
- Input validation before API calls
- Confirmation dialogs for destructive actions

### Backend Error Handling
- Request validation (required fields)
- Type checking for inputs
- Try-catch blocks around API calls
- Detailed error messages returned to client
- Graceful degradation (e.g., summary save optional)

## Security Considerations

### Client-Side Security
- No sensitive data in localStorage
- Environment variables for API keys
- No hardcoded secrets in code

### Server-Side Security
- API key stored in server environment only
- No API keys logged or exposed
- Request validation and sanitization
- Proper error messages (no stack traces to client)

### Data Security
- Files stored in Supabase (encrypted at rest)
- HTTPS for all communications
- No personal data handled
- Delete functionality removes all associated data

## Performance Optimizations

### Frontend
- Lazy loaded components with dynamic imports
- Memoization for expensive operations
- Efficient state updates
- CSS-in-JS instead of separate CSS files

### Backend
- Async/await for non-blocking operations
- No unnecessary database queries
- Efficient file handling
- API key caching in memory

### Supabase
- Bucket operations are optimized
- Public URLs for file access
- Blob storage for efficient storage

## Testing Strategy

### Unit Tests (Future)
- API route handlers
- Utility functions
- Component rendering

### Integration Tests (Future)
- Full document upload flow
- Summary generation pipeline
- Error handling scenarios

### Manual Testing
- See TESTING.md for comprehensive checklist

## Deployment Considerations

### Environment Setup
```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=dev-url
NEXT_PUBLIC_SUPABASE_KEY=dev-key

# Production
NEXT_PUBLIC_SUPABASE_URL=prod-url
NEXT_PUBLIC_SUPABASE_KEY=prod-key
```

### Deployment Platforms

#### Vercel (Recommended)
- Native Next.js support
- Automatic deployments from GitHub
- Environment variable management
- Serverless functions with unlimited concurrency

#### Other Options
- AWS Lambda
- Google Cloud Run
- Azure App Service

## Future Enhancement Ideas

### Short Term
- File upload progress indicator
- Document search functionality
- Summary versioning/history
- Export summaries (PDF, DOCX)

### Medium Term
- User authentication
- Multiple user support
- AI model selection
- Cost tracking for API usage

### Long Term
- Batch document processing
- Document comparison tool
- Advanced analytics
- Mobile app version

## Common Development Tasks

### Adding a New Feature
1. Update/create API route in `/app/api`
2. Create/update UI component in `/app`
3. Add error handling and validation
4. Update documentation
5. Test thoroughly

### Debugging
```bash
# Check logs
npm run dev

# Use VS Code debugger
# Set breakpoints and use Debug panel
```

### Code Style
- Use TypeScript for type safety
- Follow Next.js conventions
- Use consistent naming (camelCase for variables, PascalCase for components)
- Add comments for complex logic

## Environment Variables Reference

```env
# Required (Supabase)
NEXT_PUBLIC_SUPABASE_URL         # Supabase project URL
NEXT_PUBLIC_SUPABASE_KEY          # Supabase anon key

```

Note: `NEXT_PUBLIC_*` prefix makes variables available on client side. Keep API keys server-side only.

## Troubleshooting Guide

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### API Connection Issues
- Verify environment variables are set correctly
- Check Supabase bucket names (case-sensitive)
- Check network connectivity

### File Upload Issues
- Verify file type is supported (TXT or PDF)
- Check file size is under 50MB
- Ensure Supabase buckets are public

## Version History

### v1.0.0 (Initial Release)
- Document upload (TXT/PDF)
- Document viewing
- AI summary generation
- Summary editing
- Document deletion
- Multi-language support
- Supabase storage integration

---

For more information, see:
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [TESTING.md](./TESTING.md) - Testing checklist
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
