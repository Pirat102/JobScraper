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
                {"role": "system", "content": "Your task is to analyze job descriptions and extract key information about qualifications and skills, clearly distinguishing between 'necessary' and 'nice-to-have' skills using HTML formatting (e.g., use <strong> for bold instead of **). Summarize responsibilities briefly in sentence form (not bullet points). Exclude details about salary, location, company, benefits, or perks. Deliver a concise, insightful response in the same language as the prompt (typically English or Polish)."},
                {
                    "role": "user",
                    "content": text
                }
            ],
            max_tokens=3500,
            temperature=0.7,
        )
        summary = completion.choices[0].message.content
        return summary
    except Exception as e:
        print(f"Error summarizing text: {e}")
        return "Summary could not be generated"
