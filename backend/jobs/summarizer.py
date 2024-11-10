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
                    Create concise job summaries (max 200 words) with the following structure:

                    1. A brief overview paragraph explaining core responsibilities (2-3 sentences).

                    2. Two clearly separated sections with HTML formatting:
                       
                       <strong>Necessary skills:</strong>
                       <ul>
                       - List key required skills (max 6 points)
                       - Use <strong> tags for technical skills
                       - Keep each point brief
                       </ul>

                       <strong>Nice-to-have skills:</strong>
                       <ul>
                       - List preferred skills (max 4 points)
                       - Use <strong> tags for technical skills
                       - Keep each point brief
                       </ul>

                    Rules:
                    - Exclude details about salary, location, company, benefits, or perks
                    - Use HTML lists with <ul> and proper spacing
                    - Maintain consistent formatting
                    - Keep the language same as input (English or Polish), else translate to English
                    - Focus on technical and professional requirements
                    """
                },
                {
                    "role": "user",
                    "content": text
                }
            ],
            max_tokens=1500, 
            temperature=0.7,
        )
        summary = completion.choices[0].message.content
        return summary
    except Exception as e:
        print(f"Error summarizing text: {e}")
        return "Summary could not be generated"