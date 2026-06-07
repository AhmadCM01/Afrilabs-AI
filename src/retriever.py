import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Load environment variables
load_dotenv()

# Global cached instances
_embeddings = None
_vectorstore = None

def get_embeddings():
    """Get or initialize the HuggingFace embeddings model (cached)."""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
    return _embeddings

def get_vectorstore():
    """Get or initialize the Chroma vectorstore (cached)."""
    global _vectorstore
    if _vectorstore is None:
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        vectorstore_dir = os.path.join(base_dir, 'vectorstore')
        collection_name = "afrilabs_ai"

        _vectorstore = Chroma(
            persist_directory=vectorstore_dir,
            embedding_function=get_embeddings(),
            collection_name=collection_name
        )
    return _vectorstore

def get_retriever(filter_doc_type=None, filter_country=None, filter_region=None, k=5):
    """
    Get a retriever for the AfriLabs AI vector store with optional filters.

    Args:
        filter_doc_type (str, optional): Filter by document type (blog, programme, report, hub)
        filter_country (str, optional): Filter by country
        filter_region (str, optional): Filter by region
        k (int): Number of documents to return

    Returns:
        VectorStoreRetriever: A retriever object
    """
    vectorstore = get_vectorstore()

    # Build where filter
    where_filter = {}
    if filter_doc_type:
        where_filter["doc_type"] = filter_doc_type
    if filter_country:
        where_filter["country"] = filter_country
    if filter_region:
        where_filter["region"] = filter_region

    # If no filters, set where to None
    search_kwargs = {"k": k}
    if where_filter:
        search_kwargs["filter"] = where_filter

    # Return the retriever
    return vectorstore.as_retriever(search_kwargs=search_kwargs)

def similarity_search(query: str, k: int = 5):
    """
    Perform a similarity search and return results as a list of dictionaries.

    Args:
        query (str): The query string
        k (int): Number of results to return

    Returns:
        list[dict]: List of result dictionaries with keys:
            - page_content: The text content
            - source_url: The source URL
            - doc_type: Document type
            - title: Document title
            - country: Country
    """
    vectorstore = get_vectorstore()

    # Retrieve more candidates for re-ranking to avoid losing relevant items
    candidates = vectorstore.similarity_search(query, k=max(k * 4, 15))
    
    query_lower = query.lower()
    scores = []
    
    # Detect query intent
    is_geography_query = any(w in query_lower for w in [
        "country", "countries", "region", "regions", "where", "located",
        "which countries", "what countries", "african countries", "how many countries"
    ])
    is_report_query = any(w in query_lower for w in ["report", "reports", "publish", "publication", "insights", "research"])
    is_join_query = any(w in query_lower for w in ["join", "membership", "member", "apply", "criteria", "fee"])
    
    for idx, doc in enumerate(candidates):
        # Base rank score (earlier retrieved is better)
        base_score = 10.0 - (idx * 0.5)
        boost = 0.0
        
        content_lower = doc.page_content.lower()
        title_lower = doc.metadata.get("title", "").lower()
        doc_type = doc.metadata.get("doc_type", "")
        
        # 1. Intent: Geography / Countries
        if is_geography_query:
            countries = ["nigeria", "kenya", "south africa", "egypt", "ghana", "cameroon", 
                         "burundi", "senegal", "uganda", "algeria", "sierra leone", "lesotho",
                         "tanzania", "malawi", "zimbabwe", "equatorial guinea", "burkina faso",
                         "congo", "drc", "democratic republic", "tunisia", "morocco", "mali",
                         "mozambique", "ivory coast", "guinea", "south sudan", "zambia",
                         "namibia", "eswatini", "gabon", "mauritius"]
            # Strong boost for hub doc_type
            if doc_type == "hub":
                boost += 8.0  # Strong hub preference for geography queries
            # Count country matches in this chunk
            match_count = sum(1 for c in countries if c in content_lower or c in title_lower)
            if match_count > 0:
                boost += 2.0 * match_count
                
        # 2. Intent: Reports / Publications
        if is_report_query:
            report_keywords = ["report", "insights", "research", "annual report", "impact report", "ecosystem insights"]
            match_count = sum(1 for w in report_keywords if w in content_lower or w in title_lower)
            if match_count > 0:
                boost += 1.5 * match_count
                
        # 3. Intent: Joining / Membership
        if is_join_query:
            join_keywords = ["join", "membership", "criteria", "apply", "fee", "operational", "workspace", "annual fee"]
            match_count = sum(1 for w in join_keywords if w in content_lower or w in title_lower)
            if match_count > 0:
                boost += 1.5 * match_count
                
        scores.append((base_score + boost, doc))
        
    # Sort candidates by boosted score descending
    scores.sort(key=lambda x: x[0], reverse=True)
    
    # Take top k
    selected_docs = [doc for score, doc in scores[:k]]


    # Convert to list of dictionaries
    results = []
    for doc in selected_docs:
        metadata = doc.metadata
        result = {
            "page_content": doc.page_content,
            "source_url": metadata.get("source_url", ""),
            "doc_type": metadata.get("doc_type", ""),
            "title": metadata.get("title", ""),
            "country": metadata.get("country", "")
        }
        results.append(result)

    return results

if __name__ == "__main__":
    # Simple test
    print("Testing retriever...")
    try:
        retriever = get_retriever(k=2)
        print("Retriever created successfully")

        # Test similarity search
        results = similarity_search("What is AfriLabs?", k=2)
        print(f"Found {len(results)} results")
        for i, result in enumerate(results):
            print(f"Result {i+1}: {result['title']} ({result['doc_type']})")
    except Exception as e:
        print(f"Error testing retriever: {e}")