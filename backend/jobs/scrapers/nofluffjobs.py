from typing import Any, Dict
from bs4 import BeautifulSoup
from .base_scraper import WebScraper

class NoFluffScraper(WebScraper):
    def __init__(self, request_limit: int):
        super().__init__(
            base_url= "https://nofluffjobs.com",
            filter_url="https://nofluffjobs.com/pl/Python?sort=newest",
            request_limit=request_limit
        )

    def get_jobs_container_selector(self) -> Dict[str, Any]:
        return {
            'name': 'div',
            'attrs': {'class': 'list-container'}
        }

    def get_listings_selector(self) -> Dict[str, Any]:
        return {
            'name': 'a',
            'attrs': {'class': 'posting-list-item'}
        }

    def get_listing_title_selector(self) -> Dict[str, Any]:
        return {
            'name': 'h3',
            'attrs': {'data-cy': 'title position on the job offer listing'}
        }

    def extract_job_link(self, job_listing: BeautifulSoup) -> str:
        return f"{self.base_url}{job_listing['href']}"

    def extract_company(self, soup: BeautifulSoup) -> str:
        element = soup.find('p', {'class': 'd-flex align-items-center mb-0'})
        if not element:
            element = soup.find('a', {'id': 'postingCompanyUrl'})
        return element.text.strip()

    def extract_location(self, soup: BeautifulSoup) -> str:
        try:
            span = soup.find('span', {'data-cy': 'location_mobile_pin'})
            if not span:
                span = soup.find('span', {'data-cy': 'location_pin'})
            
            if span:
                text = span.get_text(strip=True)
                text = text.split('+')[0].strip()
            
            if "Hybrydowo" in text or "Praca zdalna" in text:
                return ""
            return text if text else ""
        except Exception as e:
            self.logger.error(f"Error extracting location: {e}")

    def extract_operating_mode(self, soup: BeautifulSoup) -> str:
        try:       
            span = soup.find('div', {'data-cy': 'location_remote'})
            if not span:
                span = soup.find('div', {'data-cy': 'location_mobile_remote'})
                if not span:
                    span = soup.find('span', {'data-cy': 'location_mobile_pin'})
                    if not span:
                        span = soup.find('span', {'data-cy': 'location_pin'})
            
            text = span.get_text(strip=True)
            
            if 'Praca zdalna' in text:
                return 'Remote'
            elif 'Hybrydowo' in text:
                return 'Hybrid'
            else:
                return ""
        except Exception as e:
            self.logger.error(f"Error extracting operating mode: {e}")

        
    def extract_experience_level(self, soup: BeautifulSoup) -> str:
        span = soup.select_one('#posting-seniority span')
        return span.get_text(strip=True) if span else ""

    def extract_salary(self, soup: BeautifulSoup) -> str:
        h4 = soup.select_one('div.salary > h4.tw-mb-0')
        if h4:
            return h4.text.strip().replace('–', '-')
        else:
            return ""

    def extract_description(self, soup: BeautifulSoup) -> str:
        section_data = ['JobOffer_Requirements', 'JobOffer_Project', 'JobOffer_DailyTasks']
        description_parts = []
        
        for section_id in section_data:
            section = soup.find('section', {'data-cy-section': section_id})
            if section:
                description_parts.append(section.get_text(separator='\n', strip=True))
        
        return '\n\n'.join(description_parts)

    def get_skills_container_selector(self) -> Dict:
        return {
            'name': 'div',
            'attrs': {'id': 'posting-requirements'}
        }

    def has_skill_sections(self) -> bool:
        return True

    def get_required_skills_selector(self) -> Dict:
        return {
            'name': 'section',
            'attrs': {'branch': 'musts'}
        }
        
    def get_nice_skills_selector(self) -> Dict:
        return {
            'name': 'section',
            'attrs': {'id': 'posting-nice-to-have'}
        }
    
    def get_skill_item_selector(self) -> Dict:
        return {
            'name': 'li',
            'attrs': {}
        }

    def extract_skill_name(self, element: BeautifulSoup) -> str:
        pass

    def extract_skill_level(self, element: BeautifulSoup) -> str:
        pass
