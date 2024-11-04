from django.core.management.base import BaseCommand
from jobs.models import Job
from bs4 import BeautifulSoup
import requests
import json
import time


BASIC_URL = "https://justjoin.it"
URL = "https://justjoin.it/job-offers/all-locations/python?experience-level=junior"


class Command(BaseCommand):
    help = 'Scrape job listings from Just Join IT and save them to the Job model'


    def handle(self, *args, **kwargs):
        html = self.get_jobs_html(URL)
        offers = self.get_each_job_title_link(html)
        jobs = self.get_job_requirements(offers)
        self.save_jobs_to_model(jobs)
    

    def get_jobs_html(self, link):
        res = requests.get(link)
        res.raise_for_status()  # Raises an HTTPError if the response was an error
        return res.text

## Return dictionary title:link
    def get_each_job_title_link(self, html):
        jobs = {}
        
        soup = BeautifulSoup(html, 'html.parser')
        jobs_list = soup.find('div', {'data-test-id': 'virtuoso-item-list'})
        
        if not jobs_list:
            self.stdout.write(self.style.WARNING("No job listings found on the page"))
            return jobs
        
        job_offers = jobs_list.find_all('div', {'data-index': True})
        ## Get job title, link and create dictionary
        for job_offer in job_offers:
            job_title = job_offer.find("h3").text.strip()
            job_offer_link = f"{BASIC_URL}{job_offer.a['href']}"
            jobs[job_title] = job_offer_link
        return jobs


    ## Get job req + skills. Return nested job offer
    def get_job_requirements(self, offers):
        for title, link in offers.items():
            # Check if job with this URL already exists in the database
            if Job.objects.filter(url=link).exists() or Job.objects.filter(title=title).exists():
                self.stdout.write(self.style.WARNING(f"Job already exists in database, skipping: {title}"))
                continue  # Skip to the next job if this one already exists
            
            res = requests.get(link)
            res.raise_for_status()
            time.sleep(5)
            soup = BeautifulSoup(res.text, "html.parser")
            
            each_div = soup.find_all("div", class_="MuiBox-root css-jfr3nf")
            skills = {}
            
            ## Get job req
            for div in each_div:
                skill = div.h4.text.strip()
                level = div.span.text.strip()
                if skill and level:
                    skills[skill] = level
                    
            ## Combine job offer into dictionary    
            offers[title] = {
                "skills" : skills,
                "link" : link
                }
        return offers


        
    def save_jobs_to_model(self, jobs):
        for title, job_data in jobs.items():
            # Check for an existing job to avoid duplicates
            job, created = Job.objects.get_or_create(
                title=title,
                defaults={
                    "company": "",  
                    "location": "", 
                    "description": "", 
                    "skills": job_data.get("skills"),
                    "url": job_data.get("link"),
                    "summary": "",  # for GPT summarize
                },
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created job: {title}"))
            else:
                self.stdout.write(self.style.WARNING(f"Job already exists: {title}"))



