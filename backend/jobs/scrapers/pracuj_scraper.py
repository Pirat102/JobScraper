from typing import Any, Dict
from bs4 import BeautifulSoup
from .base_scraper import WebScraper

class PracujScraper(WebScraper):
    def __init__(self):
        super().__init__(
            base_url="",
            filter_url="https://it.pracuj.pl/praca?et=17&itth=37"
        )
        
    def get_jobs_container_selector(self) -> Dict[str, Any]:
        return {
            'name': 'div',
            'attrs': {'data-test': 'section-offers'}
        }

    def get_listings_selector(self) -> Dict[str, Any]:
        return {
            'name': 'div',
            'attrs': {'data-test': 'default-offer', 'data-test-location': 'single'}
        }

    def get_listing_title_selector(self) -> Dict[str, Any]:
        return {
            'name': 'a',
            'attrs': {'class': 'tiles_o1859gd9'}
        }

    def extract_job_link(self, job_listing: BeautifulSoup) -> str:
        try:
            link = job_listing.find('a', {'data-test': 'link-offer'})
            return link['href']
        except Exception as e:
            self.logger.error(f"Error extracting link: {e}")
            return ""
        

    def extract_company(self, soup: BeautifulSoup) -> str:
        company= soup.find('h2', {'data-test': 'text-employerName'})
        if company:
            try:
                text = company.get_text(strip=True)
                return text.split('Sp.')[0].strip()
            except Exception as e:
                self.logger.error(f"Error extracting company: {e}")
                return ""
        

    def extract_location(self, soup: BeautifulSoup) -> str:
        li = soup.find('li', {'data-test': 'sections-benefit-workplaces'})
        div = li.find('div', {'data-test': 'offer-badge-description'})
        if div:
            try:
                text = div.get_text(strip=True)
                return text.split(',')[0].strip() if text else ""
            except Exception as e:
                self.logger.error(f"Error extracting location: {e}")
                return ""

        

    def extract_operating_mode(self, soup: BeautifulSoup) -> str:
        li = soup.find('li', {'data-scroll-id': 'work-modes'})
        div = li.find('div', {'data-test': 'offer-badge-title'})
        if div:
            try:
                text = div.get_text(strip=True)
                if 'praca stacjonarna' in text or 'full office' in text:
                    return 'Office'
                elif 'praca zdalna' in text or 'home office' in text:
                    return 'Remote'
                elif 'praca hybrydowa' in text or 'hybrid' in text:
                    return 'Hybrid'
                else:
                    return ""
            except Exception as e:
                self.logger.error(f"Error extracting operating mode: {e}")
                return ""

    def extract_experience_level(self, soup: BeautifulSoup) -> str:
        li = soup.find('li', {'data-scroll-id': 'position-levels'})
        div = li.find('div', {'data-test': 'offer-badge-title'})
        if div:
            try:
                text = div.get_text(strip=True)
                if 'Junior' in text:
                    return 'Junior'
                elif 'Mid' in text:
                    return 'Mid'
                elif 'Senior' in text:
                    return 'Senior'
                elif 'expert' in text:
                    return 'Expert'
                else:
                    return ""
            except Exception as e:
                self.logger.error(f"Error extracting experience level: {e}")
                return ""

    def extract_salary(self, soup: BeautifulSoup) -> str:
        div = soup.find('div', {'data-test': 'text-earningAmount'})
        if div:
            try:
                text = div.text.strip().split("zł")[0]
                formated = text.split("–")
                return f"{formated[0]} - {formated[1]} PLN" if formated else ""
            except Exception as e:
                self.logger.error(f"Error extracting salary: {e}")
                return ""

    def extract_description(self, soup: BeautifulSoup) -> str:
        try:
            section = soup.find('section', {'data-test': 'section-about-project'})
            if section:
                data = section.find_all('li', {'class': 't6laip8'})
                text_elements = [li.get_text(strip=True) for li in data]
            else:
                text_elements = ""
                
            li_elements = soup.find_all('li', {'class':'tkzmjn3'})
            li_texts = [li.get_text(strip=True) for li in li_elements]
            return '\n'.join(text_elements) + '\n' + '\n'.join(li_texts)
        except Exception as e:
            self.logger.error(f"Error extracting description: {e}")
            return ""
        

    def get_skills_container_selector(self) -> Dict:
        return {
            'name': 'section',
            'attrs': {'data-test': 'section-technologies'}
        }

    def has_skill_sections(self) -> bool:
        return True

    def get_required_skills_selector(self) -> Dict:
        return {
            'name': 'div',
            'attrs': {'data-test': 'section-technologies-expected'}
        }
        
    def get_nice_skills_selector(self) -> Dict:
        return {
            'name': 'div',
            'attrs': {'data-test': 'section-technologies-optional'}
        }

    def get_skill_item_selector(self) -> Dict:
        return {
            'name': 'li',
            'attrs': {'class': 'catru5k'}
        }

    def extract_skill_name(self, element: BeautifulSoup) -> str:
        pass

    def extract_skill_level(self, element: BeautifulSoup) -> str:
        pass
