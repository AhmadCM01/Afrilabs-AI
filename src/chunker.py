import json
import os
import pickle
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    processed_dir = os.path.join(base_dir, 'data', 'processed')
    metadata_path = os.path.join(processed_dir, 'metadata.json')
    chunks_path = os.path.join(processed_dir, 'chunks.pkl')

    # Load metadata
    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata_list = json.load(f)

    # Create a lookup dict for metadata by filename
    metadata_dict = {item['filename']: item for item in metadata_list}

    # Load all .txt files from processed directory and subdirectories
    loader = DirectoryLoader(
        processed_dir,
        glob="**/*.txt",
        loader_cls=TextLoader,
        loader_kwargs={'encoding': 'utf-8'},
        show_progress=True,
        use_multithreading=True
    )
    raw_documents = loader.load()

    print(f"Loaded {len(raw_documents)} raw documents.")

    # Enrich documents with metadata
    enriched_documents = []
    for doc in raw_documents:
        # Extract filename from the source path
        source_path = doc.metadata.get('source', '')
        filename = os.path.basename(source_path)

        # Get metadata for this file
        meta = metadata_dict.get(filename, {})

        # Create enriched metadata
        enriched_metadata = {
            'source': source_path,
            'filename': filename,
            'title': meta.get('title', 'Unknown'),
            'date': meta.get('date', 'Unknown'),
            'source_url': meta.get('source_url', ''),
            'doc_type': meta.get('doc_type', 'unknown'),
            'country': meta.get('country', 'Unknown'),
            'region': meta.get('region', None)  # Only for hubs
        }

        # Create new Document with enriched metadata
        enriched_doc = Document(
            page_content=doc.page_content,
            metadata=enriched_metadata
        )
        enriched_documents.append(enriched_doc)

    # Define chunkers for different document types
    # We'll split by doc_type since different types have different optimal chunk sizes
    blog_programme_chunker = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )

    report_chunker = RecursiveCharacterTextSplitter(
        chunk_size=600,
        chunk_overlap=50,
        length_function=len,
    )

    hub_chunker = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=30,
        length_function=len,
    )

    # Chunk documents by type
    all_chunks = []
    type_counts = {'blog': 0, 'programme': 0, 'report': 0, 'hub': 0}

    for doc in enriched_documents:
        doc_type = doc.metadata.get('doc_type', 'unknown')

        if doc_type == 'blog' or doc_type == 'programme':
            chunks = blog_programme_chunker.split_documents([doc])
            type_counts[doc_type] += len(chunks)
        elif doc_type == 'report':
            chunks = report_chunker.split_documents([doc])
            type_counts['report'] += len(chunks)
        elif doc_type == 'hub':
            chunks = hub_chunker.split_documents([doc])
            type_counts['hub'] += len(chunks)
        else:
            # Default chunker for unknown types
            chunks = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50
            ).split_documents([doc])
            type_counts[doc_type] = type_counts.get(doc_type, 0) + len(chunks)

        # Add chunk index to each chunk's metadata
        for i, chunk in enumerate(chunks):
            chunk.metadata['chunk_index'] = i
            all_chunks.append(chunk)

    print(f"Total chunks created: {len(all_chunks)}")
    print("Breakdown by doc_type:")
    for doc_type, count in type_counts.items():
        print(f"  {doc_type}: {count}")

    # Save chunks to pickle file
    with open(chunks_path, 'wb') as f:
        pickle.dump(all_chunks, f)

    print(f"Chunks saved to {chunks_path}")

if __name__ == "__main__":
    main()