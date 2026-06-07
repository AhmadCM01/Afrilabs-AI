import os
from typing import List
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import RetrievalQA
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from src.retriever import similarity_search


class ReRankedRetriever(BaseRetriever):
    """Custom retriever that uses the re-ranked similarity_search."""
    k: int = 5

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun
    ) -> List[Document]:
        results = similarity_search(query, k=self.k)
        docs = []
        for r in results:
            doc = Document(
                page_content=r["page_content"],
                metadata={
                    "source_url": r.get("source_url", ""),
                    "doc_type": r.get("doc_type", ""),
                    "title": r.get("title", ""),
                    "country": r.get("country", ""),
                }
            )
            docs.append(doc)
        return docs

def create_rag_chain():
    """
    Create a RAG chain using Groq LLM and the AfriLabs AI retriever.

    Returns:
        RetrievalQA: A RAG chain ready for querying
    """
    # Load environment variables
    load_dotenv()

    # Get Groq API key from environment
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")

    # Initialize the LLM
    llm = ChatGroq(
        groq_api_key=groq_api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=0.1,  # Low temperature for more factual responses
        max_tokens=2048
    )

    # Define the prompt template
    prompt_template = """You are AfriLabs AI, the official knowledge assistant for AfriLabs — Africa's largest network of 500+ innovation hubs across 53 countries. Your knowledge comes from AfriLabs' official blog posts, reports, programmes, and member hubs.

Use only the information provided in the context to answer the user's question. If you don't know the answer based on the context, say "I don't have enough information to answer that question based on the available AfriLabs knowledge base."

Context:
{context}

Question: {question}

Answer: """

    PROMPT = PromptTemplate(
        template=prompt_template,
        input_variables=["context", "question"]
    )

    # Get the re-ranked retriever
    retriever = ReRankedRetriever(k=5)  # Retrieve top 5 relevant chunks (with re-ranking)

    # Create the RAG chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",  # Use the "stuff" chain type to put all context in one prompt
        retriever=retriever,
        chain_type_kwargs={"prompt": PROMPT},
        return_source_documents=True  # Return source documents for verification
    )

    return qa_chain

# Global cached RAG chain
_rag_chain = None

def get_rag_chain():
    """Get or initialize the RAG chain (cached)."""
    global _rag_chain
    if _rag_chain is None:
        _rag_chain = create_rag_chain()
    return _rag_chain

def query_rag_chain(question: str):
    """
    Query the RAG chain with a question and return the answer and sources.

    Args:
        question (str): The user's question

    Returns:
        dict: Dictionary with keys 'answer' and 'sources'
    """
    qa_chain = get_rag_chain()
    result = qa_chain({"query": question})

    # Extract source information
    sources = []
    if "source_documents" in result:
        for doc in result["source_documents"]:
            metadata = doc.metadata
            source_info = {
                "page_content": doc.page_content[:200] + "...",  # Truncate for brevity
                "source_url": metadata.get("source_url", ""),
                "doc_type": metadata.get("doc_type", ""),
                "title": metadata.get("title", ""),
                "country": metadata.get("country", "")
            }
            sources.append(source_info)

    return {
        "answer": result["result"],
        "sources": sources
    }

if __name__ == "__main__":
    # Simple test
    print("Testing RAG chain...")
    try:
        # Test with a simple question
        test_question = "What is AfriLabs?"
        result = query_rag_chain(test_question)
        print(f"Question: {test_question}")
        print(f"Answer: {result['answer']}")
        print(f"Number of sources: {len(result['sources'])}")
    except Exception as e:
        print(f"Error testing RAG chain: {e}")