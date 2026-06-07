import fitz  # PyMuPDF
import json
import os
import re
from slugify import slugify

def clean_text(text):
    """
    Clean extracted text: remove excessive whitespace, lone page numbers, repeated headers/footers.
    """
    # Replace multiple newlines with a single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with a single space
    text = re.sub(r' +', ' ', text)
    # Remove lines that are just numbers (likely page numbers)
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.isdigit() and len(stripped) <= 4:  # Assuming page numbers are up to 4 digits
            continue
        cleaned_lines.append(line)
    text = '\n'.join(cleaned_lines)
    # Strip leading/trailing whitespace
    text = text.strip()
    return text

def extract_pdf_text(pdf_path):
    """
    Extract text from a PDF file using PyMuPDF.
    """
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            page_text = page.get_text()
            text += page_text + "\n"
        doc.close()
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return None
    return text

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    raw_reports_dir = os.path.join(base_dir, 'data', 'raw', 'reports')
    processed_reports_dir = os.path.join(base_dir, 'data', 'processed', 'reports')
    metadata_path = os.path.join(base_dir, 'data', 'processed', 'metadata.json')

    # Create directories if they don't exist
    os.makedirs(raw_reports_dir, exist_ok=True)
    os.makedirs(processed_reports_dir, exist_ok=True)

    # Load existing metadata
    metadata = []
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            try:
                metadata = json.load(f)
            except json.JSONDecodeError:
                metadata = []

    # Process each PDF in raw_reports_dir
    pdf_files = [f for f in os.listdir(raw_reports_dir) if f.lower().endswith('.pdf')]
    print(f"Found {len(pdf_files)} PDF files to process.")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(raw_reports_dir, pdf_file)
        print(f"Processing: {pdf_file}")

        # Extract text
        extracted_text = extract_pdf_text(pdf_path)
        if extracted_text is None:
            print(f"Skipping {pdf_file} due to extraction error.")
            continue

        # Clean text
        cleaned_text = clean_text(extracted_text)

        # Create output filename (same name, .txt extension)
        txt_filename = os.path.splitext(pdf_file)[0] + '.txt'
        txt_path = os.path.join(processed_reports_dir, txt_filename)

        # Save cleaned text
        with open(txt_path, 'w', encoding='utf-8') as f:
            f.write(cleaned_text)

        # Prepare metadata entry
        # We don't have a title from the PDF, so we use the filename (without extension) as title
        title = os.path.splitext(pdf_file)[0].replace('_', ' ').replace('-', ' ')
        # We don't have a date, so we set to "Unknown"
        date = "Unknown"
        source_url = ""  # Not available

        metadata.append({
            "filename": txt_filename,
            "title": title,
            "date": date,
            "source_url": source_url,
            "doc_type": "report",
            "country": "pan-Africa"
        })

        print(f"Saved: {txt_filename}")

    # Save updated metadata
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"PDF extraction complete. Processed {len(pdf_files)} files.")

if __name__ == "__main__":
    main()