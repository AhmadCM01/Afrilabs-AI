# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the AfriLabs AI repository.

## Development Commands

### Environment Setup
```bash
# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables (.env file)
# GROQ_API_KEY=your_groq_api_key_here
```

### Data Pipeline Execution
Run these scripts in order from project root to build the knowledge base:
```bash
# 1. Scrape blog and static pages from afrilabs.com
python src/scraper.py

# 2. Extract text from PDF reports (place PDFs in data/raw/reports/ first)
python src/pdf_extractor.py

# 3. Scrape member hubs and build documents
python src/hub_builder.py

# 4. Chunk processed documents
python src/chunker.py

# 5. Embed chunks and save to ChromaDB
python src/embedder.py
```

### Application Launch
```bash
# Start Streamlit UI
streamlit run app/main.py
```

### Testing and Evaluation
```bash
# Run retrieval unit tests
python tests/test_retrieval.py

# Generate evaluation precision report
python tests/eval_report.py
# Results saved to tests/eval_results.txt
```

### Vector Store Management
```bash
# To force re-embedding (delete existing vector store)
rm -rf vectorstore
# Then run: python src/embedder.py
```

## Code Architecture

### Data Flow Pipeline
Following the modular design:
1. **Ingestion Layer** (`src/`):
   - `scraper.py`: Extracts blog posts and static pages from AfriLabs website
   - `pdf_extractor.py`: Processes PDF reports using PyMuPDF
   - `hub_builder.py`: Scrapes member hub information from members directory

2. **Processing Layer**:
   - Outputs cleaned text files to `data/processed/{content-type}/`
   - Maintains `data/processed/metadata.json` with document metadata

3. **Indexing Layer** (`src/`):
   - `chunker.py`: Splits documents into chunks with type-specific parameters:
     - Blog/programme: 500 chars, 50 overlap
     - Reports: 600 chars, 50 overlap
     - Hubs: 300 chars, 30 overlap
   - `embedder.py`: Creates local HuggingFace embeddings (all-MiniLM-L6-v2)
   - Stores vectors in ChromaDB at `./vectorstore/`

4. **RAG Layer** (`src/`):
   - `retriever.py`: Handles similarity search with metadata filtering
   - `rag_chain.py`: Orchestrates Groq's Llama 3 70B for question answering

5. **Presentation Layer** (`app/`):
   - `main.py`: Streamlit chat interface with source citations
   - `components.py`: Reusable UI components

### Key Design Patterns
- **Modularity**: Each pipeline stage is isolated in its own script
- **Metadata-driven**: All documents carry metadata (source, type, date, country, region)
- **Local-first**: Embeddings run locally via HuggingFace, only LLM uses API
- **Extensible**: New data sources can be added by following existing patterns
- **Idempotent**: Scripts can be re-run safely (embedding skips if vector store exists)

### Tech Stack Details
- **Language**: Python 3.11+
- **Orchestration**: LangChain v0.2+ (community, huggingface, grog integrations)
- **Embeddings**: SentenceTransformers all-MiniLM-L6-v2 (384-dim, local)
- **Vector Store**: ChromaDB (persistent, local)
- **LLM**: Groq API - llama3-70b-8192 (free tier)
- **Frontend**: Streamlit
- **Scraping**: requests + BeautifulSoup4
- **PDF**: PyMuPDF (fitz)
- **Environment**: python-dotenv

## Development Workflow

### Typical Development Cycle
1. **Data Changes**: 
   - Modify ingestion scripts if website structure changes
   - Add new PDF reports to `data/raw/reports/`
   - Re-run affected pipeline stages

2. **Model/Retrieval Changes**:
   - Adjust chunking parameters in `chunker.py`
   - Change embedding model in `embedder.py` and `retriever.py`
   - Modify prompt or parameters in `rag_chain.py`

3. **UI Changes**:
   - Update `app/main.py` for interface changes
   - Modify `app/components.py` for reusable components
   - Test with `streamlit run app/main.py`

4. **Testing**:
   - Run unit tests: `python tests/test_retrieval.py`
   - Run evaluation: `python tests/eval_report.py`
   - Manual testing via Streamlit UI

### Common Tasks
- **Adding new data source**:
  1. Create new ingestion script in `src/` following existing patterns
  2. Ensure it outputs to `data/processed/{new-type}/`
  3. Update metadata with appropriate doc_type
  4. Add chunking logic in `chunker.py` for new type if needed
  5. Re-run pipeline from that point forward

- **Adjusting retrieval behavior**:
  - Modify `get_retriever()` filters in `retriever.py`
  - Adjust k parameter for more/fewer results
  - Add new metadata fields and filter support

- **Updating LLM settings**:
  - Change model name/temperature in `rag_chain.py`
  - Adjust max_tokens or prompt engineering
  - Switch to different Groq model if needed

### Maintenance Notes
- Vector store persists between runs - delete `vectorstore/` to force rebuild
- Metadata accumulates - scripts append to existing metadata.json
- PDF files must be manually placed in `data/raw/reports/`
- The scraper respects rate limits (1 second between requests)
- All API keys are stored in `.env` - never commit this file
- First embedding run takes time (depends on data volume), subsequent runs are fast

## Troubleshooting

### Common Issues
- **"Vector store already exists" message**: Delete `vectorstore/` folder to rebuild
- **Missing modules**: Run `pip install -r requirements.txt`
- **Groq API errors**: Verify `.env` contains valid GROQ_API_KEY
- **Scraping failures**: Check internet connectivity and website accessibility
- **PDF processing errors**: Ensure PDFs are not corrupted or password-protected
- **Memory issues**: Reduce chunk size or process in batches for large datasets

### Performance Optimization
- Embedding model runs on CPU by default - change `model_kwargs` for GPU if available
- ChromaDB persistence directory can be changed in `embedder.py` and `retriever.py`
- For very large datasets, consider incremental updates rather than full rebuild
- Streamlit caching can be added to `app/main.py` for repeated queries

The AfriLabs AI system is designed to be maintainable, extensible, and transparent in its operations. Each component has a single responsibility and clear interfaces between stages.