import requests
from bs4 import BeautifulSoup
import json
import os
import time
from slugify import slugify
import urllib.parse

def scrape_blog_posts(base_url, blog_dir_raw, blog_dir_processed, metadata):
    """
    Scrape all blog posts from the AfriLabs blog, including paginated pages.
    """
    page = 1
    while True:
        url = f"{base_url}/page/{page}/" if page > 1 else base_url
        print(f"Scraping blog page: {url}")
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Failed to retrieve {url}: {e}")
            break

        soup = BeautifulSoup(response.content, 'html.parser')
        # Find all blog post articles - adjust selector based on actual site structure
        posts = soup.find_all('article', class_='post')  # This is a guess; we may need to adjust
        if not posts:
            # Try alternative selectors
            posts = soup.find_all('div', class_='post')
        if not posts:
            posts = soup.find_all('article')

        if not posts:
            print(f"No posts found on page {page}. Stopping.")
            break

        for post in posts:
            try:
                # Extract title
                title_tag = post.find('h2') or post.find('h1') or post.find('h3')
                if not title_tag:
                    continue
                title = title_tag.get_text(strip=True)

                # Extract date
                date_tag = post.find('time') or post.find('span', class_='date')
                date = date_tag.get_text(strip=True) if date_tag else "Unknown"

                # Extract category (if available)
                category_tag = post.find('span', class_='category') or post.find('a', rel='category')
                category = category_tag.get_text(strip=True) if category_tag else "General"

                # Extract link to full post
                link_tag = post.find('a', href=True)
                if not link_tag:
                    continue
                post_url = link_tag['href']

                # Scrape the full post
                print(f"Scraping post: {title}")
                try:
                    post_response = requests.get(post_url, timeout=10)
                    post_response.raise_for_status()
                except requests.RequestException as e:
                    print(f"Failed to retrieve post {post_url}: {e}")
                    continue

                post_soup = BeautifulSoup(post_response.content, 'html.parser')
                # Remove unwanted elements (nav, footer, ads, etc.)
                for element in post_soup(['nav', 'footer', 'header', 'aside', 'script', 'style']):
                    element.decompose()

                # Try to find the main content
                content = post_soup.find('div', class_='content') or post_soup.find('article') or post_soup.find('div', class_='post-content')
                if not content:
                    content = post_soup  # Fallback to entire body

                body_text = content.get_text(separator=' ', strip=True)
                # Clean up extra whitespace
                body_text = ' '.join(body_text.split())

                # Create a slug for the filename
                slug = slugify(title)
                filename = f"{slug}.txt"

                # Save raw HTML? We are saving only text, so we save to both raw and processed as text.
                # For raw, we could save the HTML, but the requirement says .txt. We'll save the extracted text in both.
                raw_path = os.path.join(blog_dir_raw, filename)
                processed_path = os.path.join(blog_dir_processed, filename)

                with open(raw_path, 'w', encoding='utf-8') as f:
                    f.write(body_text)
                with open(processed_path, 'w', encoding='utf-8') as f:
                    f.write(body_text)

                # Metadata
                metadata.append({
                    "filename": filename,
                    "title": title,
                    "date": date,
                    "source_url": post_url,
                    "doc_type": "blog",
                    "country": "pan-Africa",
                    "category": category
                })

                print(f"Saved: {filename}")
                time.sleep(1)  # Be polite

            except Exception as e:
                print(f"Error processing a post: {e}")
                continue

        page += 1
        time.sleep(1)  # Between pages

def scrape_static_pages(page_urls, programmes_dir_raw, programmes_dir_processed, metadata):
    """
    Scrape individual static pages.
    """
    for url in page_urls:
        print(f"Scraping static page: {url}")
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Failed to retrieve {url}: {e}")
            continue

        soup = BeautifulSoup(response.content, 'html.parser')
        # Remove unwanted elements
        for element in soup(['nav', 'footer', 'header', 'aside', 'script', 'style']):
            element.decompose()

        # Try to find the main content
        content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
        if not content:
            content = soup  # Fallback

        # Extract title from the page
        title_tag = soup.find('h1')
        title = title_tag.get_text(strip=True) if title_tag else "Untitled"

        # Try to get date from metadata or set to unknown
        date = "Unknown"

        body_text = content.get_text(separator=' ', strip=True)
        body_text = ' '.join(body_text.split())

        slug = slugify(title)
        filename = f"{slug}.txt"

        raw_path = os.path.join(programmes_dir_raw, filename)
        processed_path = os.path.join(programmes_dir_processed, filename)

        with open(raw_path, 'w', encoding='utf-8') as f:
            f.write(body_text)
        with open(processed_path, 'w', encoding='utf-8') as f:
            f.write(body_text)

        metadata.append({
            "filename": filename,
            "title": title,
            "date": date,
            "source_url": url,
            "doc_type": "programme",
            "country": "pan-Africa"
        })

        print(f"Saved: {filename}")
        time.sleep(1)

def main():
    # Define paths
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    blog_dir_raw = os.path.join(base_dir, 'data', 'raw', 'blog')
    blog_dir_processed = os.path.join(base_dir, 'data', 'processed', 'blog')
    programmes_dir_raw = os.path.join(base_dir, 'data', 'raw', 'programmes')
    programmes_dir_processed = os.path.join(base_dir, 'data', 'processed', 'programmes')
    metadata_path = os.path.join(base_dir, 'data', 'processed', 'metadata.json')

    # Create directories if they don't exist
    for dir_path in [blog_dir_raw, blog_dir_processed, programmes_dir_raw, programmes_dir_processed]:
        os.makedirs(dir_path, exist_ok=True)

    # Load existing metadata if any
    metadata = []
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            try:
                metadata = json.load(f)
            except json.JSONDecodeError:
                metadata = []

    # Scrape blog posts
    blog_base_url = "https://www.afrilabs.com/blog"
    scrape_blog_posts(blog_base_url, blog_dir_raw, blog_dir_processed, metadata)

    # Scrape static pages
    static_pages = [
        "https://www.afrilabs.com/who-we-are-2/",
        "https://www.afrilabs.com/our-history/",
        "https://www.afrilabs.com/programmes-2/",
        "https://www.afrilabs.com/platforms-initiatives/",
        "https://www.afrilabs.com/join-afrilabs-community/",
        "https://www.afrilabs.com/afrilabs-sviyp/"
    ]
    scrape_static_pages(static_pages, programmes_dir_raw, programmes_dir_processed, metadata)

    # Save metadata
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"Scraping complete. Total entries in metadata: {len(metadata)}")

if __name__ == "__main__":
    main()