def standardize_salary(salary: str) -> str:
    """
    Standardizes salary format and converts hourly to monthly if needed.
    Handles both range format ("X - Y PLN") and single value format ("X PLN")
    """
    if not salary:
        return ""
        
    # Clean up extra spaces
    cleaned = ' '.join(salary.split())
    
    try:
        # Remove "PLN" and split on hyphen
        salary_part = cleaned.replace("PLN", "").strip()
        
        if "-" in salary_part:
            # Handle range format
            parts = salary_part.split("-")
            min_val = parts[0].strip().replace(" ", "")
            max_val = parts[1].strip().replace(" ", "")
            
            # Convert to float
            min_num = float(min_val)
            max_num = float(max_val)
            
            # Check if it's hourly (shorter numbers likely mean hourly rate)
            if len(min_val) <= 3:  # hourly rate will be like "100", "120" etc.
                min_num *= 168
                max_num *= 168
                
            # Format with thousands separator
            min_formatted = f"{int(min_num):,}".replace(",", " ")
            max_formatted = f"{int(max_num):,}".replace(",", " ")
            
            return f"{min_formatted} - {max_formatted} PLN"
        else:
            # Handle single value format
            val = salary_part.strip().replace(" ", "")
            num = float(val)
            
            if len(val) <= 3:  # hourly rate
                num *= 168
                
            formatted = f"{int(num):,}".replace(",", " ")
            return f"{formatted} PLN"
            
    except (IndexError, ValueError):
        return salary  # Return original if parsing fails