# Document Summary App

An AI-powered document management and summarization application built with Next.js. Upload documents (TXT or PDF), generate intelligent summaries using Groq AI, edit summaries, and manage all your documents securely in Supabase.

## Features

- **Document Upload**: Support for TXT and PDF files (up to 50MB each)
- **Document Viewing**: Display and read uploaded documents in the browser
- **PDF Text Extraction**: Automatically extract text from PDF files
- **AI-Powered Summaries**: Generate summaries using Groq AI
- **Custom Requirements**: Specify custom instructions for summary generation
- **Multi-Language Support**: Generate summaries in English, Chinese, or Japanese
- **Summary Editing**: Edit and save generated summaries
- **Document Management**: Delete documents and their associated summaries
- **Secure Storage**: All files stored securely in Supabase cloud storage
- **Clean English UI**: Professional, English-language user interface

## Quick Start

### Prerequisites
- Node.js 16+
- Supabase account (free at https://supabase.com)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ada-Yip/ai-summary-app.git
cd ai-summary-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Groq credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and configuration guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design decisions
- **[TESTING.md](./TESTING.md)** - Comprehensive testing checklist

## Project Structure

```
app/
├── page.tsx                 # Main dashboard
├── documents/
│   ├── layout.tsx          # Documents section layout
│   └── [name]/
│       ├── page.tsx        # Document viewer
│       └── summary/
│           └── page.tsx    # Summary generator
└── api/
    ├── documents/          # Document management APIs
    └── summary/            # Summary generation APIs
```

## Technology Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Storage**: Supabase Object Storage
- **AI**: Groq AI
- **PDF Processing**: pdf-parse
- **Language**: TypeScript

## Usage

### 1. Upload a Document
- Click "Upload Document" on the main page
- Select a TXT or PDF file
- Click "Upload"
- Your document appears in the list

### 2. View a Document
- Click the "View" button next to a document
- Document content displays in the browser
- For PDFs, text is automatically extracted

### 3. Generate a Summary
- Click the "Summary" button
- Optionally add custom requirements
- Select output language
- Click "Generate New Summary"
- AI generates a summary

### 4. Edit a Summary
- Click "Edit Summary"
- Modify the text as needed
- Click "Save Summary"

### 5. Delete a Document
- Click "Delete" next to a document
- Confirm the deletion
- Document and summary are removed

## Environment Variables

Required environment variables (copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_KEY=<your-supabase-key>
```

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/list` - List documents
- `POST /api/documents/delete` - Delete document
- `POST /api/documents/get-url` - Get public file URL
- `POST /api/documents/extract-text` - Extract PDF text

### Summaries
- `POST /api/summary/generate` - Generate summary
- `POST /api/summary/update` - Update summary
- `POST /api/summary/get` - Get existing summary

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in project settings
4. Deploy

[See SETUP.md for detailed deployment instructions](./SETUP.md#step-6-deploy-to-vercel)

## Security Notes

- API keys are stored server-side only
- Never commit `.env.local` to version control
- Use environment variables in production
- All files encrypted in Supabase storage
- No personal data collection

## Troubleshooting

### Common Issues

**API Key not working**
- Verify keys have no extra spaces
- Check `.env.local` is in project root
- Restart development server

**Summary generation fails**
- Check OpenAI API has available credits
- Verify API key is still valid
- Check input text is not empty

**Supabase bucket issues**
- Verify bucket names are "Document" and "Summary"
- Ensure buckets are set to public
- Check Supabase project is active

See [TESTING.md](./TESTING.md) for more troubleshooting solutions.

## Future Enhancements

- Document search and filtering
- Summary version history
- Export summaries (PDF/DOCX)
- User authentication and multi-user support
- Batch document processing
- Advanced analytics

## License

This project is provided for educational and commercial use.

## Support

For detailed setup instructions, see [SETUP.md](./SETUP.md)
For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md)
For testing information, see [TESTING.md](./TESTING.md)
