import re


def standardize_salary(salary: str) -> str:
    """
    Standardizes salary format and converts hourly to monthly if needed.
    """
    try:
        min_num, max_num = average_salary(salary)
        # Check if it's hourly (shorter numbers likely mean hourly rate)
        if len(str(min_num)) <= 3:
            min_num *= 168
            max_num *= 168
            
        # Format with thousands separator
        min_formatted = f"{int(min_num):,}".replace(",", " ")
        max_formatted = f"{int(max_num):,}".replace(",", " ")
        
        if min_formatted == max_formatted:
            return f"{min_formatted} PLN"
        
        return f"{min_formatted} - {max_formatted} PLN"
    
    except (IndexError, ValueError):
        return salary


    
def average_salary(salary):
    if not salary:
        return ""
    
    cleaned = ' '.join(salary.split())
    cleaned = re.sub(r',\d+', '', cleaned)
    
    # Remove "PLN" and split on hyphen
    salary_part = cleaned.replace("PLN", "").strip()
    
    if "-" in salary_part:
        # Handle range format
        parts = salary_part.split("-")
        min_val = parts[0].strip().replace(" ", "")
        max_val = parts[1].strip().replace(" ", "")
        
        min_num = int(min_val)
        max_num = int(max_val)
        
    else:
        min_num = int(salary_part.strip().replace(" ", ""))
        max_num = min_num
    
    return min_num, max_num
    
