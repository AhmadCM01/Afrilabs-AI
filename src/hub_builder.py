import requests
from bs4 import BeautifulSoup
import json
import os
import time
from slugify import slugify

# Country to region mapping
COUNTRY_TO_REGION = {
    # West Africa
    'Nigeria': 'West Africa',
    'Ghana': 'West Africa',
    'Senegal': 'West Africa',
    "Côte d'Ivoire": 'West Africa',
    'Mali': 'West Africa',
    'Burkina Faso': 'West Africa',
    'Guinea': 'West Africa',
    'Togo': 'West Africa',
    'Benin': 'West Africa',
    'Sierra Leone': 'West Africa',
    'Liberia': 'West Africa',
    'Niger': 'West Africa',
    'Gambia': 'West Africa',
    'Cape Verde': 'West Africa',
    'Mauritania': 'West Africa',
    # East Africa
    'Kenya': 'East Africa',
    'Ethiopia': 'East Africa',
    'Tanzania': 'East Africa',
    'Uganda': 'East Africa',
    'Rwanda': 'East Africa',
    'Somalia': 'East Africa',
    'Mozambique': 'East Africa',
    'Madagascar': 'East Africa',
    'Zambia': 'East Africa',
    'Malawi': 'East Africa',
    'Zimbabwe': 'East Africa',
    'Burundi': 'East Africa',
    'South Sudan': 'East Africa',
    'Eritrea': 'East Africa',
    'Djibouti': 'East Africa',
    'Comoros': 'East Africa',
    'Mauritius': 'East Africa',
    'Seychelles': 'East Africa',
    # North Africa
    'Egypt': 'North Africa',
    'Morocco': 'North Africa',
    'Tunisia': 'North Africa',
    'Algeria': 'North Africa',
    'Libya': 'North Africa',
    'Sudan': 'North Africa',
    # Southern Africa
    'South Africa': 'Southern Africa',
    'Namibia': 'Southern Africa',
    'Botswana': 'Southern Africa',
    'Lesotho': 'Southern Africa',
    'Eswatini': 'Southern Africa',
    'Angola': 'Southern Africa',
    # Central Africa
    'Cameroon': 'Central Africa',
    'DRC': 'Central Africa',  # Democratic Republic of Congo
    'Congo': 'Central Africa',  # Republic of Congo
    'Gabon': 'Central Africa',
    'Chad': 'Central Africa',
    'CAR': 'Central Africa',  # Central African Republic
    'Equatorial Guinea': 'Central Africa',
    'São Tomé': 'Central Africa',  # São Tomé and Príncipe
}

def get_region(country):
    """
    Get region for a given country.
    """
    # Try exact match first
    if country in COUNTRY_TO_REGION:
        return COUNTRY_TO_REGION[country]
    # Try to handle variations (e.g., "Democratic Republic of the Congo" vs "DRC")
    # For simplicity, we'll do a basic check - in a real app, you might want more sophisticated matching
    for known_country, region in COUNTRY_TO_REGION.items():
        if known_country.lower() in country.lower() or country.lower() in known_country.lower():
            return region
    return "Unknown"

def scrape_members_page(hubs_dir_raw, hubs_dir_processed, metadata):
    """
    Scrape the AfriLabs members page for hub information.
    """
    url = "https://www.afrilabs.com/members/"
    print(f"Scraping members page: {url}")

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Failed to retrieve {url}: {e}")
        return

    soup = BeautifulSoup(response.content, 'html.parser')
    # Remove unwanted elements
    for element in soup(['nav', 'footer', 'header', 'aside', 'script', 'style']):
        element.decompose()

    # Find hub elements - this is a guess; we need to inspect the actual structure
    # Common patterns for member directories
    hub_containers = soup.find_all('div', class_=lambda x: x and ('member' in x.lower() or 'hub' in x.lower()))
    if not hub_containers:
        hub_containers = soup.find_all('article')
    if not hub_containers:
        hub_containers = soup.find_all('li')
    if not hub_containers:
        # Fallback: look for any div that might contain hub info
        hub_containers = soup.find_all('div')

    hubs_saved = 0
    region_counts = {}

    for container in hub_containers:
        try:
            # Extract text and try to find structured data
            text = container.get_text(separator=' ', strip=True)
            if not text or len(text) < 10:  # Skip empty or too short entries
                continue

            # Try to find a title/name
            name_tag = container.find(['h1', 'h2', 'h3', 'h4', 'h5', 'strong', 'b'])
            name = name_tag.get_text(strip=True) if name_tag else ""

            # If we couldn't find a clear name, try to extract from text
            if not name or len(name) < 2:
                # Try to find the first line or first reasonable chunk
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                if lines:
                    name = lines[0]
                    # Clean up common prefixes
                    name = re.sub(r'^(Hub|Center|Centre|Innovation Hub|Innovation Centre)\s*[:\-]', '', name, flags=re.IGNORECASE).strip()

            if not name or len(name) < 2:
                continue

            # Try to find website
            website_tag = container.find('a', href=True)
            website = ""
            if website_tag:
                href = website_tag['href']
                if href.startswith('http'):
                    website = href

            # Try to find description - look for paragraphs or divs with text
            description_tag = container.find('p') or container.find('div', class_=lambda x: x and 'desc' in x.lower())
            description = ""
            if description_tag:
                description = description_tag.get_text(strip=True)

            # If we don't have a clear description, use the remaining text after removing name and website
            if not description:
                # Remove name and website from text to get description
                cleaned_text = text
                if name:
                    cleaned_text = cleaned_text.replace(name, '', 1)
                if website:
                    cleaned_text = cleaned_text.replace(website, '', 1)
                description = cleaned_text.strip()
                # Clean up extra whitespace and punctuation
                description = ' '.join(description.split())
                description = description.strip(' :-•·')

            # Determine country from the description or name (this is simplified)
            # In a real implementation, you'd need to extract country more reliably
            country = "Unknown"
            # Look for country patterns in the text
            for known_country in COUNTRY_TO_REGION.keys():
                if known_country in text:
                    country = known_country
                    break

            region = get_region(country)

            # Create hub document
            hub_doc = f"Hub: {name}. Country: {country}. Region: {region}. Website: {website}. Description: {description}"

            # Create filename
            slug = slugify(name)
            if not slug:
                slug = f"hub_{hubs_saved}"
            filename = f"{slug}.txt"

            # Save files
            raw_path = os.path.join(hubs_dir_raw, filename)
            processed_path = os.path.join(hubs_dir_processed, filename)

            with open(raw_path, 'w', encoding='utf-8') as f:
                f.write(hub_doc)
            with open(processed_path, 'w', encoding='utf-8') as f:
                f.write(hub_doc)

            # Update metadata
            metadata.append({
                "filename": filename,
                "title": name,
                "date": "Unknown",  # We don't have a date for hubs
                "source_url": website if website else url,
                "doc_type": "hub",
                "country": country,
                "region": region
            })

            # Update region counts
            region_counts[region] = region_counts.get(region, 0) + 1
            hubs_saved += 1

            print(f"Saved: {filename} ({name})")

        except Exception as e:
            print(f"Error processing a hub container: {e}")
            continue

    print(f"Hub scraping complete. Saved {hubs_saved} hubs.")
    print("Breakdown by region:")
    for region, count in sorted(region_counts.items()):
        print(f"  {region}: {count}")

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    hubs_dir_raw = os.path.join(base_dir, 'data', 'raw', 'hubs')
    hubs_dir_processed = os.path.join(base_dir, 'data', 'processed', 'hubs')
    metadata_path = os.path.join(base_dir, 'data', 'processed', 'metadata.json')

    # Create directories if they don't exist
    os.makedirs(hubs_dir_raw, exist_ok=True)
    os.makedirs(hubs_dir_processed, exist_ok=True)

    # Load existing metadata
    metadata = []
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r', encoding='utf-8') as f:
            try:
                metadata = json.load(f)
            except json.JSONDecodeError:
                metadata = []

    # Import regex for use in the function
    import re
    scrape_members_page(hubs_dir_raw, hubs_dir_processed, metadata)

    # Save metadata
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()