# Ollama Setup Guide

This app now uses **Ollama** for local AI summarization - no API keys required!

## What is Ollama?

Ollama allows you to run large language models locally on your machine. It's free, private, and doesn't require API keys.

## Installation Steps

### 1. Download and Install Ollama
- Visit: https://ollama.ai
- Download the installer for your OS (Windows, macOS, or Linux)
- Run the installer and follow the prompts

### 2. Verify Installation
Open a terminal and run:
```bash
ollama --version
```

### 3. Pull a Model
Before using the app, pull a model. We recommend **Mistral** (fast and good quality):

```bash
ollama pull mistral
```

Other model options:
- `ollama pull llama2` - Larger, more capable
- `ollama pull neural-chat` - Optimized for conversation
- `ollama pull orca-mini` - Fast and lightweight

### 4. Start Ollama Server
Run this command in a terminal (keep it running):
```bash
ollama serve
```

The server will start on `http://localhost:11434`

## Using the App

Once Ollama is running and you've pulled a model:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Upload a document (PDF or TXT)
3. Click "Generate Summary"
4. Wait for the local model to process and generate the summary

## Customization

### Change the Model
Edit `lib/ollamaClient.ts` and change:
```typescript
model: 'mistral', // Change to your preferred model
```

### Adjust Summary Quality
- **Temperature**: Lower values (0.1-0.3) = more focused summaries
- **Temperature**: Higher values (0.7-1.0) = more creative summaries

Modify in `lib/ollamaClient.ts`:
```typescript
temperature: 0.3, // Adjust this value
```

### Change the Maximum Text Length
Modify the `maxLength` variable in `lib/ollamaClient.ts` based on your model's capabilities.

## Troubleshooting

### "Failed to connect to Ollama"
- Make sure `ollama serve` is running in another terminal
- Check that the port is 11434 (or update `OLLAMA_API_URL` in your environment)

### Slow summaries
- Try a smaller model like `orca-mini`
- Reduce the `maxLength` for shorter texts

### Out of memory errors
- Use a smaller model
- Reduce the context window in the prompt

## Benefits

✅ **No API costs** - runs locally, completely free
✅ **Privacy** - your documents never leave your machine  
✅ **Fast** - especially with smaller models
✅ **No internet required** - works offline
✅ **Customizable** - choose any model you want
