export const formatDate = (dateString, language) => {
    const date = new Date(dateString);
    const options = {
      minute: "numeric",
      hour: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
  
    return language === "pl" 
      ? date.toLocaleDateString("pl-PL", options)
      : date.toLocaleDateString("en-US", options);
  };