from typing import Any, Dict, Optional
from bs4 import BeautifulSoup
from jobs.models import Job

from jobs.models import Requested
from .base_scraper import WebScraper
from playwright.async_api import async_playwright
import asyncio

class JustJoinScraper(WebScraper):
    
    def __init__(self, request_limit: int):
        super().__init__(
            base_url="https://justjoin.it",
            filter_urls=["https://justjoin.it/job-offers/all-locations/python?targetCurrency=pln&orderBy=DESC&sortBy=newest",
                         "https://justjoin.it/job-offers/all-locations/javascript?targetCurrency=pln&orderBy=DESC&sortBy=newest"],
            request_limit=request_limit
        )

    def run(self) -> int:
        """Main entry point for the scraper."""
        try:
            html = asyncio.run(self.get_main_html())
            job_listings = self.get_job_listings(html)
            jobs_data = self.process_job_listings(job_listings)
            return self.save_jobs(jobs_data)
        except Exception as e:
            self.logger.error(f"Error in scraping process: {e}")
            return 0


    async def get_main_html(self) -> list[str]:
        pages = []
        async with async_playwright() as p:
            # Increase viewport height to see more items at once
            try:
                browser = await p.firefox.launch(headless=True)
                page = await browser.new_page(viewport={'width': 1280, 'height': 20000})
                
                for url in self.filter_urls:
                    await page.goto(url)
                    await page.wait_for_selector('[data-test-id="virtuoso-item-list"]')
                    
                    html = await page.content()
                    pages.append(html)
                        
            finally:
                await page.close()
                await browser.close()
        return pages
    
    def _get_job_page(self, link: str, title: str) -> Optional[BeautifulSoup]:
        """Fetches and parses individual job posting page with request limit."""
        if self.request_count >= self.request_limit:
            return None
        
        if Requested.objects.filter(url=link).exists():
            return None
        
        try:
            def run_playwright():
                async def get_page():
                    async with async_playwright() as p:
                        browser = await p.firefox.launch(headless=True)
                        
                        # Create context with all headers
                        context = await browser.new_context(
                            locale='pl-PL',
                            extra_http_headers={
                                'Accept-Language': 'pl-PL,pl;q=0.6',
                                'Cache-Control': 'max-age=0',
                                'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0"
                            }
                        )
                        # Add cookies with required parameters
                        await context.add_cookies([{
                            'name': 'userCurrency', 
                            'value': 'pln',
                            'domain': '.justjoin.it',
                            'path': '/'
                        }])
                        
                        page = await context.new_page()
                        
                        try:
                            await page.goto(link)
                            await page.wait_for_timeout(3000)
                            html = await page.content()
                            await browser.close()
                            return html
                        finally:
                            await page.close()
                            await context.close()
                            await browser.close()
                    
                return asyncio.run(get_page())
            
            html = run_playwright()
            self.request_count += 1
            Requested.objects.create(url=link, title=title)
            self.logger.info(f"Requested: {title}")
            
            return BeautifulSoup(html, "html.parser")
        except Exception as e:
            self.logger.error(f"Failed to request {title}: {e}")
            return None
    
    def get_jobs_container_selector(self) -> Dict[str, Any]:
        return {
            'name': 'div',
            'attrs': {'data-test-id': 'virtuoso-item-list'}
        }
        

    def get_listings_selector(self) -> Dict[str, Any]:
        return {
            'name': 'div',
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
        mode_divs = soup.find_all("div", {"class": "MuiBox-root css-snbmy4"})
        return mode_divs[3].text.strip() if len(mode_divs) > 3 else ""
    
    def extract_experience_level(self, soup: BeautifulSoup) -> str:
        mode_divs = soup.find_all("div", {"class": "MuiBox-root css-snbmy4"})
        if "C-level" in mode_divs[1].text.strip():
            return "Expert"

        return mode_divs[1].text.strip() if mode_divs else ""
    
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


    
    