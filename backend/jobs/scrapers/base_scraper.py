from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
from jobs.models import Job
import time
import logging
from typing import Dict, Any
from django.db import transaction
from jobs.summarizer import summarize_text

class WebScraper(ABC):
    def __init__(self, base_url: str, filter_url: str):
        self.base_url = base_url
        self.filter_url = filter_url
        self.logger = logging.getLogger(self.__class__.__name__)

    # Core Methods
    # -----------------------------------------------
    def run(self) -> int:
        try:
            main_html = self.get_main_html()
            postings = self.get_each_job_title_link(main_html)
            jobs_data = self.get_job_data(postings)
            return self.save_jobs_to_model(jobs_data)
        except Exception as e:
            self.logger.error(f"Error in scraping process: {e}")

    def get_main_html(self) -> str:
        res = requests.get(self.filter_url)
        res.raise_for_status()
        return res.text

    # Job Listings Processing
    # -----------------------------------------------
    def get_each_job_title_link(self, main_html: str) -> Dict[str, Dict[str, str]]:
        jobs = {}
        soup = BeautifulSoup(main_html, 'html.parser')
        containers = soup.find_all(**self.get_jobs_container_selector())
        
        if not containers:
            self.logger.warning("No job listings found on the page")
            return jobs
        
        for container in containers:
            jobs.update(self._process_container(container))
        return jobs

    def _process_container(self, container) -> Dict[str, Dict[str, str]]:
        jobs = {}
        try:
            job_listings = container.find_all(**self.get_listings_selector())
            for job_listing in job_listings:
                try:
                    title = job_listing.find(**self.get_listing_title_selector()).text.strip()
                    link = self.extract_job_link(job_listing)
                    jobs[title] = {"link": link}
                except AttributeError as e:
                    self.logger.error(f"Error processing job listing: {e}")
        except Exception as e:
            self.logger.error(f"Error processing container: {e}")
        return jobs

    # Detailed Job Data Processing
    # -----------------------------------------------
    def get_job_data(self, postings: Dict) -> Dict:
        result = {}
        for title, job_data in dict(postings).items():
            try:
                link = job_data["link"]
                if Job.objects.filter(url=link).exists():
                    continue

                soup = self.get_job_page_html(link, title)
                job_details = self._extract_job_details(soup, link)
                result[title] = job_details

            except Exception as e:
                self.logger.error(f"Error processing {title}: {e}")
                continue
        return result

    def _extract_job_details(self, soup: BeautifulSoup, link: str) -> Dict[str, Any]:
        return {
            "company": self.extract_company(soup),
            "location": self.extract_location(soup),
            "operating_mode": self.extract_operating_mode(soup),
            "salary": self.extract_salary(soup),
            "description": self.extract_description(soup),
            "skills": self.extract_skills(soup),
            "link": link
        }

    def get_job_page_html(self, link: str, title: str) -> BeautifulSoup:
        res = requests.get(link)
        self.logger.info(f"Requested: {title}")
        res.raise_for_status()
        time.sleep(5)
        return BeautifulSoup(res.text, "html.parser")

    # Skills Processing
    # -----------------------------------------------
    def extract_skills(self, soup: BeautifulSoup) -> Dict[str, str]:
        if self.has_skill_sections():
            return self.extract_sectioned_skills(soup)
        return self.extract_single_container_skills(soup)

    def extract_sectioned_skills(self, soup: BeautifulSoup) -> Dict[str, str]:
        skills = {}
        container = soup.find(**self.get_skills_container_selector())
        if not container:
            return skills

        self._process_required_skills(container, skills)
        self._process_nice_to_have_skills(container, skills)
        return skills

    def _process_required_skills(self, container: BeautifulSoup, skills: Dict[str, str]):
        required = container.find(**self.get_required_skills_selector())
        if required:
            for skill in required.find_all(**self.get_skill_item_selector()):
                skill_name = skill.find("span")
                if skill_name:
                    skills[skill_name.text.strip()] = "junior"

    def _process_nice_to_have_skills(self, container: BeautifulSoup, skills: Dict[str, str]):
        nice = container.find(**self.get_nice_skills_selector())
        if nice:
            for skill in nice.find_all(**self.get_skill_item_selector()):
                skill_name = skill.find("span")
                if skill_name:
                    skills[skill_name.text.strip()] = "nice to have"

    def extract_single_container_skills(self, soup: BeautifulSoup) -> Dict[str, str]:
        skills = {}
        container = soup.find(**self.get_skills_container_selector())
        if not container:
            return skills

        for element in container.find_all(**self.get_skill_item_selector()):
            skill_name = self.extract_skill_name(element)
            skill_level = self.extract_skill_level(element)
            if skill_name and skill_level:
                skills[skill_name] = skill_level
        return skills

    # Database Operations
    # -----------------------------------------------
    @transaction.atomic
    def save_jobs_to_model(self, jobs_data: Dict) -> int:
        jobs_created = 0
        for title, job_data in jobs_data.items():
            description = job_data.get("description")
            summary = summarize_text(description) if description else ""

            job, created = Job.objects.get_or_create(
                url=job_data.get("link"),
                defaults={
                    "title": title,
                    "company": job_data.get("company"),
                    "location": job_data.get("location"),
                    "operating_mode": job_data.get("operating_mode"),
                    "salary": job_data.get("salary"),
                    "description": description,
                    "skills": job_data.get("skills"),
                    "summary": summary,
                }
            )
            if created:
                jobs_created += 1
                self.logger.info(f"Created job: {title}")

        return jobs_created

    # Abstract Methods That Need Implementation
    # -----------------------------------------------
    @abstractmethod
    def get_jobs_container_selector(self) -> Dict[str, Any]:
        """
        Define how to find the main container that holds all job listings.
        Returns:
        {
            'name': 'div',
            'attrs': {'class': 'jobs-container'}  # Example
        }
        """
        pass

    @abstractmethod
    def get_listings_selector(self) -> Dict[str, Any]:
        """
        Define how to find individual job listings within the container.
        Returns:
        {
            'name': 'div',
            'attrs': {'class': 'job-card'}  # Example with attributes
        }
        or
        {
            'name': 'a',
            'attrs': {}  # Empty if no attributes needed
        }
        """
        pass

    @abstractmethod
    def get_listing_title_selector(self) -> Dict[str, Any]:
        """
        Define how to find the title element within a job listing.
        Returns:
        {
            'name': 'h3',
            'attrs': {'class': 'job-title'}  # Optional attributes
        }
        """
        pass

    @abstractmethod
    def extract_job_link(self, job_listing: BeautifulSoup) -> str:
        """
        Extract job URL from the listing element.
        Args:
            job_listing: BeautifulSoup element containing the job listing
        Returns:
            Complete URL string (e.g., "https://example.com/jobs/123")
        """
        pass

    @abstractmethod
    def extract_company(self, soup: BeautifulSoup) -> str:
        """
        Extract company name from job details page.
        Args:
            soup: BeautifulSoup object of the job details page
        Returns:
            Company name as string
        """
        pass

    @abstractmethod
    def extract_location(self, soup: BeautifulSoup) -> str:
        """
        Extract job location from job details page.
        Args:
            soup: BeautifulSoup object of the job details page
        Returns:
            Location as string (e.g., "New York, Remote")
        """
        pass

    @abstractmethod
    def extract_operating_mode(self, soup: BeautifulSoup) -> str:
        """
        Extract job's operating mode from job details page.
        Args:
            soup: BeautifulSoup object of the job details page
        Returns:
            Operating mode as string (e.g., "Remote", "Hybrid", "Office")
        """
        pass

    @abstractmethod
    def extract_salary(self, soup: BeautifulSoup) -> str:
        """
        Extract salary information from job details page.
        Args:
            soup: BeautifulSoup object of the job details page
        Returns:
            Salary as string (e.g., "$80,000 - $100,000")
        """
        pass

    @abstractmethod
    def extract_description(self, soup: BeautifulSoup) -> str:
        """
        Extract job description from job details page.
        Args:
            soup: BeautifulSoup object of the job details page
        Returns:
            Full job description as string
        """
        pass

    @abstractmethod
    def get_skills_container_selector(self) -> Dict:
        """
        Define how to find the container that holds all skills.
        Returns:
        {
            'name': 'div',
            'attrs': {'id': 'skills-section'}  # Example
        }
        """
        pass

    @abstractmethod
    def has_skill_sections(self) -> bool:
        """
        Indicate if the website separates skills into required/nice-to-have sections.
        Returns:
            True if site has separate sections (like NoFluffJobs)
            False if site has single skills list (like JustJoinIT)
        """
        pass

    def get_required_skills_selector(self) -> Dict:
        """
        Define how to find the required skills section.
        Only needed if has_skill_sections() returns True.
        Returns:
        {
            'name': 'section',
            'attrs': {'class': 'required-skills'}  # Example
        }
        """
        pass

    def get_nice_skills_selector(self) -> Dict:
        """
        Define how to find the nice-to-have skills section.
        Only needed if has_skill_sections() returns True.
        Returns:
        {
            'name': 'section',
            'attrs': {'class': 'optional-skills'}  # Example
        }
        """
        pass

    @abstractmethod
    def get_skill_item_selector(self) -> Dict:
        """
        Define how to find individual skill items within skills container.
        Returns:
        {
            'name': 'div',
            'attrs': {'class': 'skill-item'}  # Example
        }
        """
        pass

    @abstractmethod
    def extract_skill_name(self, element: BeautifulSoup) -> str:
        """
        Extract skill name from a skill element.
        Args:
            element: BeautifulSoup element containing a single skill
        Returns:
            Skill name as string (e.g., "Python", "Docker")
        """
        pass

    @abstractmethod
    def extract_skill_level(self, element: BeautifulSoup) -> str:
        """
        Extract skill level from a skill element.
        Args:
            element: BeautifulSoup element containing a single skill
        Returns:
            Skill level as string (e.g., "junior", "regular", "senior")
        """
        pass