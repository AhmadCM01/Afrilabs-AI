import os
import sys
import pickle
import shutil
from dotenv import load_dotenv
from langchain_community.embeddings import FastEmbedEmbeddings
from langchain_community.vectorstores import Chroma

# Load environment variables
load_dotenv()

def main(force_rebuild: bool = False):
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    chunks_path = os.path.join(base_dir, 'data', 'processed', 'chunks.pkl')
    vectorstore_dir = os.path.join(base_dir, 'vectorstore')
    collection_name = "afrilabs_ai"

    # If force_rebuild, delete existing vectorstore
    if force_rebuild and os.path.exists(vectorstore_dir):
        print("Force rebuild: deleting existing vectorstore...")
        shutil.rmtree(vectorstore_dir)

    # Check if vectorstore already exists and has documents
    if not force_rebuild and os.path.exists(vectorstore_dir):
        # We can try to load the vectorstore and check the collection size
        try:
            embeddings = FastEmbedEmbeddings(
                model_name="BAAI/bge-small-en-v1.5"
            )
            vectorstore = Chroma(
                persist_directory=vectorstore_dir,
                embedding_function=embeddings,
                collection_name=collection_name
            )
            # Get the number of documents in the collection
            count = vectorstore._collection.count()
            if count > 0:
                print(f"Vector store already exists with {count} vectors. Skipping re-embedding.")
                print("Use --force to rebuild the vectorstore.")
                return
        except Exception as e:
            print(f"Error checking existing vector store: {e}")
            # If there's an error, we'll proceed to recreate

    # Load chunks
    with open(chunks_path, 'rb') as f:
        chunks = pickle.load(f)

    print(f"Loaded {len(chunks)} chunks from {chunks_path}")

    # Initialize embeddings
    embeddings = FastEmbedEmbeddings(
        model_name="BAAI/bge-small-en-v1.5"
    )

    # Create vector store
    print("Creating embeddings and saving to ChromaDB...")
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=vectorstore_dir,
        collection_name=collection_name
    )

    print(f"Embedding complete. {vectorstore._collection.count()} vectors stored in ChromaDB.")

if __name__ == "__main__":
    force = "--force" in sys.argv
    main(force_rebuild=force)