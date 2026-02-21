# Document Summary App - Setup Guide

This AI-powered document summary application allows users to upload documents (TXT and PDF), view them, generate AI-powered summaries, and edit those summaries. All documents and summaries are securely stored in Supabase.

## Features

- **Upload Documents**: Support for TXT and PDF files (up to 50MB)
- **View Documents**: Display document content in the browser
- **PDF Text Extraction**: Automatically extract text from PDF files
- **AI Summary Generation**: Generate summaries using OpenAI API
- **Custom Summary Requirements**: Specify custom requirements for summaries
- **Multiple Languages**: Generate summaries in English, Chinese, or Japanese
- **Edit Summaries**: Edit and save generated summaries
- **Document Management**: Delete documents and their associated summaries
- **Secure Storage**: All files stored in Supabase object storage

## Technology Stack

- **Frontend**: Next.js 16+ with React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Database/Storage**: Supabase (Object Storage)
- **AI**: OpenAI GPT-3.5-turbo
- **PDF Processing**: pdf-parse library

## Prerequisites

Before setting up the application, you'll need:

1. **Node.js** (v16 or higher)
2. A **Supabase Account** (free tier available at https://supabase.com)
3. An **OpenAI Account** with API access (https://openai.com/api)
4. **Git** for version control

## Step 1: Set Up Supabase

1. Go to https://supabase.com and sign up for a free account
2. Create a new project
3. Navigate to **Storage** and create two new buckets:
   - **Bucket name**: `Document`
   - **Bucket name**: `Summary`
4. Go to **Project Settings → API** to get:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `Anon Key` (NEXT_PUBLIC_SUPABASE_KEY)

## Step 2: Set Up OpenAI API

1. Go to https://openai.com/api and sign up
2. Navigate to **API Keys** and create a new secret key
3. Copy the key (you'll need it for `.env.local`)

## Step 3: Install Dependencies

```bash
npm install
```

Required packages:
- `@supabase/supabase-js` - Supabase client
- `openai` - OpenAI API client
- `pdf-parse` - PDF text extraction
- `next`, `react`, `react-dom` - React and Next.js

## Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_KEY=[your-anon-key]

# OpenAI Configuration
OPENAI_API_KEY=sk-[your-openai-api-key]
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 5: Run the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com and connect your GitHub account
3. Import your `ai-summary-app` repository
4. Add environment variables in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`
   - `OPENAI_API_KEY`
5. Deploy

## API Endpoints

### Documents

#### Upload Document
- **POST** `/api/documents/upload`
- Body: `multipart/form-data` with `file` field
- Response: `{ path: string, success: boolean }`

#### List Documents
- **GET** `/api/documents/list`
- Response: `{ files: Array<{name: string, id: string}> }`

#### Get Document URL
- **POST** `/api/documents/get-url`
- Body: `{ path: string }`
- Response: `{ publicUrl: string }`

#### Extract Text from PDF
- **POST** `/api/documents/extract-text`
- Body: `{ path: string }`
- Response: `{ text: string }`

#### Delete Document
- **POST** `/api/documents/delete`
- Body: `{ path: string }`
- Response: `{ success: true, message: string }`

### Summaries

#### Generate Summary
- **POST** `/api/summary/generate`
- Body: `{ documentName: string, text: string, requirement?: string, language?: string }`
- Response: `{ summary: string, success: boolean }`

#### Update Summary
- **POST** `/api/summary/update`
- Body: `{ documentName: string, summary: string }`
- Response: `{ success: true, message: string }`

#### Get Summary
- **POST** `/api/summary/get`
- Body: `{ documentName: string }`
- Response: `{ summary: string | null }`

## Using the Application

### Upload a Document
1. Go to the main page
2. Click the file input and select a TXT or PDF file
3. Click "Upload"
4. Your document will appear in the "Your Documents" table

### View a Document
1. Find the document in the table
2. Click the "View" button
3. The document content will be displayed
4. For PDFs, text is automatically extracted

### Generate a Summary
1. Click the "Summary" button for a document
2. Optionally enter "Summary Requirements" (e.g., "Focus on key findings")
3. Select the output language (English, Chinese, or Japanese)
4. Click "Generate New Summary"
5. The AI will generate a summary based on the document

### Edit a Summary
1. Once a summary is generated, click "Edit Summary"
2. Modify the text as needed
3. Click "Save Summary" to persist changes
4. Click "Cancel" to discard changes

### Delete a Document
1. Find the document in the table
2. Click the "Delete" button
3. Confirm the deletion in the dialog
4. The document and its summary will be deleted from storage

## Troubleshooting

### API Key Not Working
- Verify that keys are correctly copied (no extra spaces)
- Check that `.env.local` is in the project root
- Restart the development server after adding environment variables

### PDF Extraction Fails
- Ensure the PDF file is not corrupted
- Check that the file size is under 50MB
- Some encrypted PDFs may not extract correctly

### Summary Generation Fails
- Check that your OpenAI API key has credits available
- Verify the API key is still valid
- Check the input text is not empty

### Supabase Storage Issues
- Verify bucket names are exactly "Document" and "Summary"
- Check that buckets are set to public (for public URL access)
- Ensure your Supabase project is active

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use Vercel environment variables** for production deployments
3. **Restrict Supabase bucket access** if needed through policies
4. **Rotate API keys regularly** for OpenAI and Supabase
5. **Use separate keys** for development and production

## Performance Tips

- Large files may take longer to process
- PDF extraction can be memory-intensive for large documents
- Consider implementing file upload progress tracking for large files
- Cache summaries to reduce API calls

## Future Enhancements

- Multiple document batch processing
- Summary comparison tools
- Document version history
- Search and filter documents
- Export summaries as PDF/Word
- Multi-user support with authentication
- Custom AI models selection
- Webhook notifications

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API Documentation in Next.js docs
3. Check Supabase documentation
4. Review OpenAI API documentation

## License

This project is provided as-is for educational and commercial use.
