export const initialFilters = {
    operating_mode: "",
    experience: "",
    skills: [],
    location: "",
    scraped_date: "",
    source: "",
  };
  
  export const filterSections = [
    {
      id: 'operating_mode',
      title: 'Tryb pracy',
      defaultOpen: true,
      options: [
        { value: 'Remote', label: 'Remote' },
        { value: 'Hybrid', label: 'Hybrid' },
        { value: 'Office', label: 'Office' },
      ]
    },
    {
      id: 'experience',
      title: 'Poziom stanowiska',
      defaultOpen: true,
      options: [
        { value: 'trainee', label: 'Trainee' },
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid' },
        { value: 'senior', label: 'Senior' },
        { value: 'expert', label: 'Expert' },
      ]
    },
    {
      id: 'skills',
      title: 'Technologie',
      defaultOpen: true,
      isSkillSection: true,
      topSkills: []
    },
    {
      id: 'location',
      title: 'Lokalizacja',
      defaultOpen: false,
      options: [
        { value: 'Warszawa', label: 'Warszawa' },
        { value: 'Kraków', label: 'Kraków' },
        { value: 'Wrocław', label: 'Wrocław' },
        { value: 'Poznań', label: 'Poznań' },
        { value: 'Gdańsk', label: 'Gdańsk' },
      ]
    },
    {
      id: 'scraped_date',
      title: 'Daty od',
      defaultOpen: false,
      options: []
    },
    {
      id: 'source',
      title: 'Źródło',
      defaultOpen: false,
      options: [
        { value: 'Pracuj.pl', label: 'Pracuj.pl' },
        { value: 'NoFluffJobs', label: 'NoFluffJobs' },
        { value: 'JustJoinIT', label: 'JustJoinIT' },
        { value: 'TheProtocol', label: 'TheProtocol' },
      ]
    }
  ];