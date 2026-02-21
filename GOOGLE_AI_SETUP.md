# Google Generative AI Setup Guide

This app now uses **Google Generative AI (Gemini)** instead of local Ollama for text summarization. This eliminates the need for local LLM installation while providing high-quality AI-powered summaries.

## What Changed

### Previous Setup (Ollama)
- Requires local Ollama installation
- Needs separate terminal session to run `ollama serve`
- Model must be downloaded locally
- No internet required but uses local resources

### New Setup (Google Generative AI)
- Cloud-based API (no local installation)
- Requires Google API key (free tier available)
- Much faster and more capable
- Internet connection required

## Setup Instructions

### 1. Get Google Generative AI API Key

1. Visit: https://makersuite.google.com/app/apikeys
2. Sign in with your Google account (create one if needed)
3. Click **"Create API Key"**
4. Copy the generated API key

### 2. Update `.env.local`

Edit `/workspaces/ai-summary-app/.env.local` and replace:

```
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

Replace `your_google_ai_api_key_here` with the API key from step 1.

Example:
```
GOOGLE_AI_API_KEY=AIzaSyDxT-yV3z2AkL4bN5M6oP7qR8sToU9vWxY
```

### 3. Install Dependencies (if needed)

```bash
npm install
```

No additional packages are required - the app uses standard fetch API to call Google's API.

### 4. Run the App

```bash
npm run dev
```

The app will start at http://localhost:3000

## Features

- **Free Tier**: Google Generative AI offers a free tier with usage limits
- **Multi-Language Support**: Summaries in English, Chinese, Japanese, etc.
- **Custom Requirements**: Specify how you want your summary formatted
- **Fallback Mode**: If API key is missing, uses basic text extraction
- **Error Handling**: Clear error messages if API is unavailable

## Pricing

Google Generative AI is free for reasonable usage. Check https://ai.google.dev/pricing for current limits and pricing.

## Troubleshooting

### "GOOGLE_AI_API_KEY is not configured"
- Make sure you've added the key to `.env.local`
- Restart the app after updating environment variables

### "Failed to download file"
- This is now fixed by using server-side file downloads
- Make sure Supabase credentials are correct

### Rate Limit Errors
- You may have exceeded free tier limits
- Check Google's usage dashboard

## File Download Fix

The app now uses server-side file downloading instead of public URLs, which eliminates CORS issues when fetching files from Supabase.

## Migration Notes

If you were using Ollama:
1. Remove `ollama serve` terminal (no longer needed)
2. Delete the old OLLAMA_API_URL from `.env.local` (replaced with GOOGLE_AI_API_KEY)
3. The `lib/ollamaClient.ts` file is kept for reference but no longer used

For any issues, check the browser console and server logs for detailed error messages.
