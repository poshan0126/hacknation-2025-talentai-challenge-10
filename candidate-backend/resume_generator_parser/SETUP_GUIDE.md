# 🚀 Setup Guide for Groq and Local LLM Summarizers

## 📋 Prerequisites

### For Groq API:
- Python 3.8+
- Groq API key from [console.groq.com](https://console.groq.com/)

### For Local LLM:
- Python 3.8+
- Sufficient RAM (8GB+ recommended)
- GPU optional but recommended for speed

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

#### Option A: Using .env file
```bash
# Copy the template
cp env.example .env

# Edit .env file with your settings
nano .env
```

#### Option B: Export directly
```bash
# For Groq
export GROQ_API_KEY="your_actual_groq_api_key"
export RESUME_PROVIDER="groq"

# For Local LLM
export RESUME_PROVIDER="local"
export RESUME_LOCAL_MODEL_PATH="/path/to/your/model"
```

## 🧪 Testing Your Setup

### Quick Test
```bash
python3 test_summarizers.py
```

### Individual Provider Tests

#### Test Groq Only:
```bash
# Set Groq as provider
export RESUME_PROVIDER="groq"
export GROQ_API_KEY="your_key"

# Test
python3 -c "
from llm_summarizer import get_summarizer
s = get_summarizer()
print('Provider:', s.get_current_provider_name())
print('Available:', s.get_available_providers())
"
```

#### Test Local Only:
```bash
# Set Local as provider
export RESUME_PROVIDER="local"

# Test
python3 -c "
from llm_summarizer import get_summarizer
s = get_summarizer()
print('Provider:', s.get_current_provider_name())
print('Available:', s.get_available_providers())
"
```

## 🔍 Troubleshooting

### Groq Issues:
- **"GROQ_API_KEY not set"**: Set your API key in environment
- **"Groq library not installed"**: Run `pip install groq`
- **"Failed to initialize Groq client"**: Check API key validity

### Local LLM Issues:
- **"transformers not installed"**: Run `pip install transformers torch accelerate`
- **"No model path specified"**: Set `RESUME_LOCAL_MODEL_PATH` or use default models
- **"CUDA not available"**: Models will run on CPU (slower but functional)

### Common Issues:
- **Import errors**: Make sure you're in the correct directory
- **Configuration errors**: Check your .env file syntax
- **Permission errors**: Ensure you have read/write access to the directory

## 📊 Expected Test Output

### Successful Groq Test:
```
🧪 Resume Summarizer Testing Suite
==================================================
🔧 Testing Configuration...
✅ Config loaded successfully
   Provider: groq
   Groq API Key: ✅ Set
   Local Model Path: ❌ Not set

🚀 Testing Groq Provider...
   ✅ Groq provider is available
   Model: llama3-8b-8192
   Max Tokens: 500
   Temperature: 0.3

📊 TEST RESULTS SUMMARY
==================================================
Configuration: ✅ PASS
Groq Provider: ✅ PASS
Local Provider: ❌ FAIL
Integration: ✅ PASS
Summarization: ✅ PASS

🎉 At least one provider is working!
   🚀 Groq API is ready to use
```

### Successful Local Test:
```
🧪 Resume Summarizer Testing Suite
==================================================
🔧 Testing Configuration...
✅ Config loaded successfully
   Provider: local
   Groq API Key: ❌ Not set
   Local Model Path: ✅ Set

🏠 Testing Local Provider...
   ✅ Local provider is available
   Model Path: /path/to/model
   Device: cpu
   Max Tokens: 500
   Temperature: 0.3

📊 TEST RESULTS SUMMARY
==================================================
Configuration: ✅ PASS
Groq Provider: ❌ FAIL
Local Provider: ✅ PASS
Integration: ✅ PASS
Summarization: ✅ PASS

🎉 At least one provider is working!
   🏠 Local LLM is ready to use
```

## 🎯 Next Steps

After successful testing:

1. **Use the CLI**:
   ```bash
   python3 main.py --input resume.md --output ./output --provider groq
   ```

2. **Start the API**:
   ```bash
   uvicorn api:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Process resumes programmatically**:
   ```python
   from llm_summarizer import get_summarizer
   from resume_parser import get_parser
   
   summarizer = get_summarizer()
   parser = get_parser()
   
   # Parse and summarize
   resume_data = parser.parse_file("resume.md")
   summary = summarizer.summarize_resume(resume_data)
   ```

If you encounter issues:
1. Check the error messages carefully
2. Verify your environment variables
3. Ensure all dependencies are installed
4. Check the troubleshooting section above
