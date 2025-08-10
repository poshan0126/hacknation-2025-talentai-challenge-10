# Complete Resume Pipeline

This project provides a comprehensive pipeline for generating synthetic resumes, parsing them to extract structured information, generating AI-powered summaries using Groq, and saving all data to organized JSON files.

## Features

- **Resume Generation**: Creates realistic synthetic resumes in markdown format
- **Resume Parsing**: Extracts structured data (education, experience, skills) from resume files
- **AI Summarization**: Generates professional summaries using Groq's LLM service
- **Data Export**: Saves parsed data and summaries to organized JSON and text files
- **Pipeline Reporting**: Comprehensive execution reports and statistics

## Prerequisites

- Python 3.8+
- Groq API key (for LLM summarization)
- Required Python packages (see `requirements.txt`)

## Installation

1. Clone or download the project files
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set your Groq API key:
   ```bash
   export GROQ_API_KEY="your-api-key-here"
   ```
   
   Or create a `.env` file:
   ```bash
   echo "GROQ_API_KEY=your-api-key-here" > .env
   ```

## Usage

### Command Line Interface

The main script can be run from the command line:

```bash
# Generate 5 resumes (default)
python resume_pipeline_complete.py

# Generate 10 resumes
python resume_pipeline_complete.py --count 10

# Specify output directory
python resume_pipeline_complete.py --output-dir ./my_resumes

# Provide Groq API key directly
python resume_pipeline_complete.py --groq-api-key "your-key-here"

# Enable verbose logging
python resume_pipeline_complete.py --verbose
```

### Programmatic Usage

You can also use the pipeline in your own Python code:

```python
from resume_pipeline_complete import CompleteResumePipeline
from pathlib import Path

# Initialize pipeline
pipeline = CompleteResumePipeline(
    output_dir=Path("./output"),
    groq_api_key="your-api-key"
)

# Run pipeline
results = pipeline.run_pipeline(count=5)

if results["success"]:
    print(f"Generated {results['statistics']['successfully_generated']} resumes")
    print(f"Execution time: {results['statistics']['execution_time_seconds']} seconds")
```

See `example_usage.py` for a complete example.

## Output Structure

The pipeline creates the following directory structure:

```
output_directory/
├── resumes/                    # Generated markdown resume files
│   ├── alex_johnson_001.md
│   ├── jordan_smith_002.md
│   └── ...
├── parsed/                     # JSON files with parsed data + summaries
│   ├── alex_johnson_001_parsed.json
│   ├── jordan_smith_002_parsed.json
│   └── ...
├── summaries/                  # Text files with just the summaries
│   ├── alex_johnson_001_summary.txt
│   ├── jordan_smith_002_summary.txt
│   └── ...
└── pipeline_report.json        # Execution report and statistics
```

## JSON Output Format

Each parsed resume JSON file contains:

```json
{
  "filename": "resume.md",
  "parsed_at": "2024-01-15T10:30:00Z",
  "data": {
    "name": "Alex Johnson",
    "title": "Software Engineer",
    "email": "alex.johnson@email.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA",
    "education": [...],
    "experience": [...],
    "skills": {...}
  },
  "summary": "Experienced Software Engineer with 5+ years...",
  "llm_provider": "groq",
  "llm_model": "llama3-8b-8192"
}
```

## Configuration

### Groq API Key

The pipeline requires a Groq API key for LLM summarization. You can provide it:

1. **Environment variable**: `export GROQ_API_KEY="your-key"`
2. **Command line**: `--groq-api-key "your-key"`
3. **Programmatically**: Pass to `CompleteResumePipeline()`

### Customization

You can customize various aspects:

- **Resume count**: Number of resumes to generate
- **Output directory**: Where to save generated files
- **Summary parameters**: Length, focus areas, tone
- **LLM provider**: Switch between Groq and local models

## Error Handling

The pipeline includes robust error handling:

- **Fallback summaries**: If LLM fails, generates basic summaries
- **Partial success**: Continues processing even if some steps fail
- **Detailed logging**: Comprehensive error messages and debugging info
- **Graceful degradation**: Continues with available functionality

## Performance

Typical performance metrics:

- **Resume generation**: ~0.1 seconds per resume
- **Parsing**: ~0.05 seconds per resume
- **LLM summarization**: ~2-5 seconds per resume (depends on Groq API)
- **File I/O**: ~0.01 seconds per file

For 10 resumes, total execution time is typically 30-60 seconds.

## Troubleshooting

### Common Issues

1. **No Groq API key**: Pipeline will use fallback summaries
2. **Rate limiting**: Built-in delays prevent API throttling
3. **File permissions**: Ensure write access to output directory
4. **Memory issues**: Large numbers of resumes may require more RAM

### Debug Mode

Enable verbose logging for detailed debugging:

```bash
python resume_pipeline_complete.py --verbose
```

### API Limits

Groq has rate limits. The pipeline includes:
- 0.5 second delays between API calls
- Automatic fallback to basic summaries
- Error logging for failed API calls

## Extending the Pipeline

The modular design makes it easy to extend:

- **New resume formats**: Add parsers for PDF, Word, etc.
- **Additional LLM providers**: Implement new `LLMProvider` classes
- **Custom output formats**: Extend the export functionality
- **Batch processing**: Add support for processing existing resume files

## License

This project is provided as-is for educational and development purposes.

## Support

For issues or questions:
1. Check the error logs and console output
2. Verify your Groq API key is valid
3. Ensure all dependencies are installed
4. Check file permissions for output directories
