from typing import Any, Dict
from bs4 import BeautifulSoup

from .base_scraper import WebScraper


class JustJoinScraper(WebScraper):
    
    def __init__(self, request_limit: int):
        super().__init__(
            base_url="https://justjoin.it",
            filter_urls=["https://justjoin.it/job-offers/all-locations/python?targetCurrency=pln&orderBy=DESC&sortBy=newest",
                         "https://justjoin.it/job-offers/all-locations/javascript?targetCurrency=pln&orderBy=DESC&sortBy=newest"],
            request_limit=request_limit
        )

    
    def get_jobs_container_selector(self) -> Dict[str, Any]:
        return {
            'name': 'div',
            'attrs': {'id': 'up-offers-list'}
        }
        

    def get_listings_selector(self) -> Dict[str, Any]:
        return {
            'name': 'li',
            'attrs': {'data-index': True}
        }

    def get_listing_title_selector(self) -> Dict[str, Any]:
        return {
            'name': 'h3',
            'attrs': {}
        }

    def extract_job_link(self, job_listing: BeautifulSoup) -> str:
        return f"{self.base_url}{job_listing.a['href']}?targetCurrency=pln"
    
    def extract_company(self, soup: BeautifulSoup) -> str:
        div_elements = soup.find("div", {"class": "MuiBox-root css-yd5zxy"})
        return div_elements.h2.text.strip() if div_elements else ""

    def extract_location(self, soup: BeautifulSoup) -> str:
        div_elements = soup.find("div", {"class": "MuiBox-root css-yd5zxy"})
        location_span = div_elements.find("span", {"class": "css-1o4wo1x"})
        return location_span.text.strip() if location_span else ""

    def extract_operating_mode(self, soup: BeautifulSoup) -> str:
        mode_divs = soup.find_all("div", {"class": "MuiBox-root css-pretdm"})
        texts = mode_divs[3].find_all("div")
        operating_mode = texts[-1].text.strip()

        return operating_mode if operating_mode else ""
    
    def extract_experience_level(self, soup: BeautifulSoup) -> str:
        mode_divs = soup.find_all("div", {"class": "MuiBox-root css-pretdm"})
        texts = mode_divs[1].find_all("div")
        experience = texts[-1].text.strip()
        if "C-level" in experience:
            return "Expert"

        return experience if experience else ""
    
    def extract_salary(self, soup: BeautifulSoup) -> str:
        salary_elements = soup.findChildren("span", {"class": "css-1pavfqb"})
        return salary_elements[0].text.strip() if salary_elements else ""

    def extract_description(self, soup: BeautifulSoup) -> str:
        target_div = soup.find("div", {"class": "MuiBox-root css-tbycqp"})
        return target_div.get_text(separator='\n', strip=True) if target_div else ""

    def get_skills_container_selector(self) -> Dict:
        return {
            'name': 'div',
            'attrs': {'class': 'MuiStack-root css-6r2fzw'}
        }

    def has_skill_sections(self) -> bool:
        return False


    def get_skill_item_selector(self) -> Dict:
        return {
            'name': 'div',
            'attrs': {'class': 'MuiBox-root css-jfr3nf'}
        }
    
    def extract_skill_name(self, element: BeautifulSoup) -> str:
        return element.h4.text.strip()

    def extract_skill_level(self, element: BeautifulSoup) -> str:
        return element.span.text.strip()


    def get_required_skills_selector(self) -> Dict:
        pass

    def get_nice_skills_selector(self) -> Dict:
        pass


    
    
