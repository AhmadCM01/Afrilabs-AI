import os
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from retriever import similarity_search, get_retriever

def test_retriever_creation():
    """Test that we can create a retriever."""
    print("Testing retriever creation...")
    try:
        retriever = get_retriever(k=2)
        print("[OK] Retriever created successfully")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to create retriever: {e}")
        return False

def test_similarity_search():
    """Test similarity search with a simple query."""
    print("\nTesting similarity search...")
    try:
        # This test assumes we have some data in the vector store
        # In a real scenario, we would run the ingestion pipeline first
        results = similarity_search("AfriLabs", k=2)
        print(f"[OK] Similarity search returned {len(results)} results")
        if results:
            print(f"  First result: {results[0]['title']} ({results[0]['doc_type']})")
        return True
    except Exception as e:
        print(f"[FAIL] Similarity search failed: {e}")
        return False

def test_retriever_with_filters():
    """Test retriever with filters."""
    print("\nTesting retriever with filters...")
    try:
        retriever = get_retriever(
            filter_doc_type="blog",
            filter_country="pan-Africa",
            k=2
        )
        print("[OK] Filtered retriever created successfully")
        return True
    except Exception as e:
        print(f"[FAIL] Failed to create filtered retriever: {e}")
        return False

def main():
    """Run all tests."""
    print("Running retrieval tests...\n")

    tests = [
        test_retriever_creation,
        test_similarity_search,
        test_retriever_with_filters
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1

    print(f"\n{'='*50}")
    print(f"Tests passed: {passed}/{total}")

    if passed == total:
        print("All tests passed! [OK]")
        return 0
    else:
        print("Some tests failed! [FAIL]")
        return 1

if __name__ == "__main__":
    sys.exit(main())