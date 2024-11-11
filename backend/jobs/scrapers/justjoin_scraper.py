from typing import Any, Dict
from .base_scraper import WebScraper

class JustJoinScraper(WebScraper):
    
    def __init__(self):
        super().__init__(
            base_url="https://justjoin.it",
            filter_url="https://justjoin.it/job-offers/all-locations/python?experience-level=junior"
        )
    
    