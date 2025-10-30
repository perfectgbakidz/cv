

export interface PersonalInfo {
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | '';
  phone: string;
  email: string;
  address: string;
  linkedin: string;
  portfolio: string;
  profilePicture: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Skill {
  id: string;
  skill: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | '';
}

export interface Certification {
  id:string;
  name: string;
  issuer: string;
  date: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tools: string;
}

export interface Award {
    id: string;
    name: string;
    year: string;
    description: string;
}

export interface Language {
    id: string;
    language: string;
    proficiency: 'Basic' | 'Intermediate' | 'Fluent' | '';
}

export interface Referee {
    id: string;
    name: string;
    title: string;
    contact: string;
    relationship: string;
}

export interface ApplicationLetterData {
  hiringManager: string;
  companyName: string;
  jobTitle: string;
  sourceOfJobAd: string;
  letterBody: string;
}

export interface CoverLetterData {
  recipientName: string;
  recipientDepartment: string;
  companyName: string;
  companyAddress: string;
  jobTitle: string;
  sourceOfJobAd: string;
  keyRequirements: string;
  companyValues: string;
  letterBody: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  careerObjective: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  certifications: Certification[];
  projects: Project[];
  awards: Award[];
  languages: Language[];
  hobbies: string;
  referees: Referee[];
  applicationLetter: ApplicationLetterData;
  coverLetter: CoverLetterData;
}

// A generic type for validation errors
export type Errors = {
    [key: string]: string | undefined;
};