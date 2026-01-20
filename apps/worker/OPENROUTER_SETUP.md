# OpenRouter Setup Guide

## Get Your Free API Key

1. Go to https://openrouter.ai/
2. Sign up with GitHub or email
3. Go to https://openrouter.ai/keys
4. Click "Create Key"
5. Copy your API key

## Configure RepoLens

1. Open `apps/worker/.env`
2. Replace `your-openrouter-api-key-here` with your actual API key:
   ```
   OPENROUTER_API_KEY=sk-or-v1-your-actual-key
   ```
3. Save the file
4. Restart the worker

## Why Devstral?

- **Free**: No cost, no credit card needed
- **Code-Optimized**: Specifically trained for code analysis
- **Fast**: Quick response times
- **Reliable**: Good uptime and availability

## Alternative Free Models

If `mistralai/devstral-2512:free` isn't working, try these:

- `google/gemini-2.0-flash-exp:free` - Google's latest
- `meta-llama/llama-3.1-8b-instruct:free` - Meta's Llama
- `qwen/qwen-2.5-coder-32b-instruct:free` - Alibaba's coder model

Change the model in `.env`:
```
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

## Test Your Setup

After updating the API key, test with:
```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/your-username/small-repo","branch":"main"}'
```

Check the scan results for AI-generated summaries!
