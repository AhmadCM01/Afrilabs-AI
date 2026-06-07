import os
import json
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from retriever import similarity_search

def load_test_questions():
    """
    Load test questions from a predefined list.
    In a real implementation, this could be loaded from a file.
    """
    test_questions = [
        {
            "question": "What is AfriLabs?",
            "expected_keywords": ["AfriLabs", "innovation hubs", "Africa", "network"]
        },
        {
            "question": "How many innovation hubs are in the AfriLabs network?",
            "expected_keywords": ["500+", "53", "countries", "innovation hubs"]
        },
        {
            "question": "What is the AfriLabs Capacity Building Programme (ACBP)?",
            "expected_keywords": ["Capacity Building Programme", "ACBP", "training", "entrepreneurs"]
        },
        {
            "question": "Which countries have AfriLabs innovation hubs?",
            "expected_keywords": ["Nigeria", "Kenya", "South Africa", "Egypt", "Ghana"]
        },
        {
            "question": "What types of reports does AfriLabs publish?",
            "expected_keywords": ["ecosystem insights", "impact report", "annual report", "research"]
        },
        {
            "question": "How can an innovation hub join AfriLabs?",
            "expected_keywords": ["join", "membership", "application", "criteria"]
        },
        {
            "question": "What initiatives does AfriLabs have for women entrepreneurs?",
            "expected_keywords": ["RevUp Women", "female founders", "women", "entrepreneurship"]
        },
        {
            "question": "What is the AfriLabs annual gathering called?",
            "expected_keywords": ["Annual Gathering", "meeting", "conference", "event"]
        }
    ]
    return test_questions

def evaluate_retrieval(question, expected_keywords, k=3):
    """
    Evaluate retrieval for a single question.

    Returns:
        dict: Evaluation results
    """
    try:
        results = similarity_search(question, k=k)

        # Check if any results contain expected keywords
        relevant_count = 0
        for result in results:
            content = result['page_content'].lower()
            title = result['title'].lower()
            # Check if any expected keyword appears in content or title
            for keyword in expected_keywords:
                if keyword.lower() in content or keyword.lower() in title:
                    relevant_count += 1
                    break  # Count each result only once

        # Precision: fraction of retrieved results that are relevant
        precision = relevant_count / len(results) if results else 0
        # Recall: fraction of expected keywords that were found (simplified)
        # For simplicity, we'll use a binary approach: if we found at least one relevant result
        recall = 1.0 if relevant_count > 0 else 0.0
        # F1 score
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0

        return {
            "question": question,
            "expected_keywords": expected_keywords,
            "num_results": len(results),
            "relevant_results": relevant_count,
            "precision": precision,
            "recall": recall,
            "f1_score": f1,
            "results": results[:2]  # Store first 2 results for inspection
        }
    except Exception as e:
        return {
            "question": question,
            "error": str(e),
            "precision": 0,
            "recall": 0,
            "f1_score": 0
        }

def main():
    """Main evaluation function."""
    print("Running retrieval evaluation...\n")

    test_questions = load_test_questions()

    all_results = []
    total_precision = 0
    total_recall = 0
    total_f1 = 0

    for i, test_item in enumerate(test_questions):
        print(f"Evaluating question {i+1}/{len(test_questions)}: {test_item['question']}")
        result = evaluate_retrieval(
            test_item['question'],
            test_item['expected_keywords']
        )
        all_results.append(result)

        if 'error' not in result:
            total_precision += result['precision']
            total_recall += result['recall']
            total_f1 += result['f1_score']
            print(f"  Precision: {result['precision']:.2f}, Recall: {result['recall']:.2f}, F1: {result['f1_score']:.2f}")
        else:
            print(f"  Error: {result['error']}")
        print()

    # Calculate averages
    num_successful = len([r for r in all_results if 'error' not in r])
    if num_successful > 0:
        avg_precision = total_precision / num_successful
        avg_recall = total_recall / num_successful
        avg_f1 = total_f1 / num_successful
    else:
        avg_precision = avg_recall = avg_f1 = 0

    # Save detailed results
    output_data = {
        "evaluation_summary": {
            "total_questions": len(test_questions),
            "successful_evaluations": num_successful,
            "average_precision": avg_precision,
            "average_recall": avg_recall,
            "average_f1_score": avg_f1
        },
        "detailed_results": all_results
    }

    output_path = os.path.join(os.path.dirname(__file__), 'eval_results.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("AfriLabs AI Retrieval Evaluation Results\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total Questions: {len(test_questions)}\n")
        f.write(f"Successful Evaluations: {num_successful}\n")
        f.write(f"Average Precision: {avg_precision:.2f}\n")
        f.write(f"Average Recall: {avg_recall:.2f}\n")
        f.write(f"Average F1 Score: {avg_f1:.2f}\n\n")
        f.write("Detailed Results:\n")
        f.write("-" * 30 + "\n")
        for i, result in enumerate(all_results):
            f.write(f"\nQuestion {i+1}: {result.get('question', 'N/A')}\n")
            if 'error' in result:
                f.write(f"  ERROR: {result['error']}\n")
            else:
                f.write(f"  Precision: {result['precision']:.2f}\n")
                f.write(f"  Recall: {result['recall']:.2f}\n")
                f.write(f"  F1 Score: {result['f1_score']:.2f}\n")
                f.write(f"  Results Retrieved: {result['num_results']}\n")
                f.write(f"  Relevant Results: {result['relevant_results']}\n")
                f.write(f"  Expected Keywords: {', '.join(result['expected_keywords'])}\n")
                if result['results']:
                    f.write("  Top Results:\n")
                    for j, res in enumerate(result['results'][:2]):
                        f.write(f"    {j+1}. {res['title']} ({res['doc_type']})\n")
                        f.write(f"       Content preview: {res['page_content'][:100]}...\n")

    print(f"Evaluation complete. Results saved to {output_path}")
    print(f"Average Precision: {avg_precision:.2f}")
    print(f"Average Recall: {avg_recall:.2f}")
    print(f"Average F1 Score: {avg_f1:.2f}")

    return 0 if num_successful > 0 else 1

if __name__ == "__main__":
    sys.exit(main())