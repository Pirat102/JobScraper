from typing import Any, Dict
from bs4 import BeautifulSoup
from .base_scraper import WebScraper
import re
import inspect


class TheProtocolScraper(WebScraper):
    def __init__(self, request_limit: int):
        super().__init__(
            base_url= "https://theprotocol.it",
            filter_url="https://theprotocol.it/filtry/python;t",
            request_limit=request_limit
        )

    def get_jobs_container_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'div',
            'attrs': {'data-test': 'offersList'}
        }

    def get_listings_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'a',
            'attrs': {'data-test': 'list-item-offer'}
        }

    def get_listing_title_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'h2',
            'attrs': {'id': 'offer-title'}
        }

    def extract_job_link(self, job_listing: BeautifulSoup) -> str:
        return f"{self.base_url}{job_listing['href']}"

    def extract_company(self, soup: BeautifulSoup) -> str:
        element = soup.find('h2', {'data-test': 'text-offerEmployer'})
        return element.text.strip()

    def extract_location(self, soup: BeautifulSoup) -> str:
        element = soup.find_all('div', {'data-test': 'text-workplaceAddress'})
        return element[0].text.strip() if element else ""
        

    def extract_operating_mode(self, soup: BeautifulSoup) -> str:
        container = soup.find('div', {'data-test': 'section-workModes'})
        element = container.find('div', {'class': 'r4179ok bldcnq5 ihmj1ec'})
        operating_mode = element.text.strip()
        
        if 'praca zdalna' in operating_mode or 'remote work' in operating_mode:
                return 'Remote'
        elif 'praca hybrydowa' in operating_mode or 'hybrid work' in operating_mode:
            return 'Hybrid'
        elif 'praca stacjonarna' in operating_mode or 'full office work' in operating_mode:
            return 'Office'

    def extract_experience_level(self, soup: BeautifulSoup) -> str:
        container = soup.find('div', {'data-test': 'section-positionLevels'})
        element = container.find('div', {'class': 'r4179ok bldcnq5 ihmj1ec'})
        experience = element.text.strip()
        
        if 'trainee' in experience or 'assistant' in experience:
            return 'Trainee'
        elif 'junior' in experience:
            return 'Junior'
        elif 'mid' in experience:
            return 'Mid'
        elif 'senior' in experience:
            return 'Senior'
        elif 'expert' in experience:
            return 'Expert'
        else:
            return 'Manager'

    def extract_salary(self, soup: BeautifulSoup) -> str:
        element = soup.find('p', {'data-test': 'text-contractSalary'})
        if element:
            stripped = element.text.strip().split('zł')[0]
            formated = stripped.replace('–', '-').split('-')
            return f"{formated[0]} - {formated[1]}PLN"
        else:
            return ""
        

    def extract_description(self, soup: BeautifulSoup) -> str:
        sections_ids = ['TECHNOLOGY_AND_POSITION', 'ABOUT_US']
        description_parts = []
        for section_id in sections_ids:
            section = soup.find('div', {'id': section_id})
            if section:
                description_parts.append(section.get_text(separator='\n', strip=True))
        return '\n\n'.join(description_parts)

    def get_skills_container_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'div',
            'attrs': {'data-test': 'section-technologies'}
        }

    def has_skill_sections(self) -> bool:
        return True

    def get_required_skills_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'div',
            'attrs': {'class': 'c1fj2x2p'}
        }

    def get_nice_skills_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'div',
            'attrs': {'class': 'c1fj2x2p'}
        }

    def get_skill_item_selector(self) -> Dict[str, Dict[str, str]]:
        return {
            'name': 'div',
            'attrs': {'data-test': 'chip-technology'}
        }

    def _process_sectioned_skills(self, soup: BeautifulSoup, experience: str) -> Dict[str, str]:
        """Override the parent method to handle Protocol.it's specific structure"""
        skills = {}
        if container := soup.find(**self.get_skills_container_selector()):
            # Find all sections with skills
            sections = container.find_all('div', {'class': 'c1fj2x2p'})
            
            for section in sections:
                # Check if this is required or optional section
                header = section.find('h3')
                if not header:
                    continue
                
                header_text = header.text.strip().lower()
                is_required = 'expected' in header_text or 'wymagane' in header_text
                
                # Process skills in this section
                for skill in section.find_all(**self.get_skill_item_selector()):
                    if skill_span := skill.find('span', {'class': 'l1sjc53z'}):
                        skill_name = skill_span.text.strip()
                        if is_required:
                            skills[skill_name] = self.get_standardized_skill_level(experience)
                        else:
                            skills[skill_name] = 'nice to have'
        
        return skills

    def extract_skill_name(self, element: BeautifulSoup) -> str:
        pass

    def extract_skill_level(self, element: BeautifulSoup) -> str:
        pass

    
  