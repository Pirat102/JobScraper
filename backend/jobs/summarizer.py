from openai import OpenAI
from django.conf import settings

# Use the API key
api_key = settings.OPENAI_API_KEY

client = OpenAI()

def summarize_text(text: str) -> str:
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """
                    Create concise job summaries (max 250 words) with the following structure:

                    1. A brief overview paragraph (<p>) explaining core responsibilities (2-3 sentences).

                    2. Two clearly separated sections with HTML formatting:
                       
                       <strong>Necessary skills:</strong>
                       <ul>
                       <li> List key required skills (max 6 points) </li>
                       <li> Use <strong> tags for technical skills </li>
                       <li> Keep each point brief </li>
                       </ul>

                       <strong>Nice-to-have skills:</strong>
                       <ul>
                       <li> List preferred skills (max 4 points) </li>
                       <li> Use <strong> tags for technical skills </li>
                       <li> Keep each point brief </li>
                       </ul>

                    Rules:
                    - Exclude details about salary, location, company, benefits, or perks
                    - Use HTML lists with <ul> and proper spacing
                    - Maintain consistent formatting
                    - Section 'Necessary skills' should start from a new line
                    - Focus on technical and professional requirements
                    - If input is primarily in English (>50 percent of words): Keep response in English
                    - If input is primarily in Polish (>50 percent of words): Keep response in Polish
                    - If input is neither Polish or English, translate to English

                        Note: Language dominance is determined by word count. For example:
                        - "Poszukujemy Senior Software Developer z minimum 5 lat doświadczenia w Java. Wymagana znajomość Spring Boot i REST API. Praca w zespole scrumowym."
                        → Response in Polish (more Polish words)
                        - "Senior Java Developer wanted. Szukamy do naszego zespołu."
                        → Response in English (more English words)
                    """
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            max_tokens=2000, 
            temperature=0.7,
        )
        summary = completion.choices[0].message.content
        return summary
    except Exception as e:
        print(f"Error summarizing text: {e}")
        return "Summary could not be generated"