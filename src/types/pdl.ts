export interface PDLProfileResponse {
  status: number;
  likelihood: number;
  data: PDLProfileData;
}

export interface PDLProfileData {
  id: string;
  full_name: string;
  first_name: string;
  middle_initial: string | null;
  middle_name: string | null;
  last_initial: string;
  last_name: string;
  sex: string;
  birth_year: boolean;
  birth_date: boolean;
  linkedin_url: string;
  linkedin_username: string;
  linkedin_id: string;
  facebook_url: string | null;
  facebook_username: string | null;
  facebook_id: string | null;
  twitter_url: string | null;
  twitter_username: string | null;
  github_url: string | null;
  github_username: string | null;
  work_email: boolean;
  personal_emails: boolean;
  recommended_personal_email: boolean;
  mobile_phone: boolean;
  industry: string;
  job_title: string;
  job_title_role: string;
  job_title_sub_role: string;
  job_title_class: string;
  job_title_levels: string[];
  job_company_id: string;
  job_company_name: string;
  job_company_website: string;
  job_company_size: string;
  job_company_founded: number;
  job_company_industry: string;
  job_company_linkedin_url: string;
  job_company_linkedin_id: string;
  job_company_facebook_url: string | null;
  job_company_twitter_url: string | null;
  job_company_location_name: string;
  job_company_location_locality: string;
  job_company_location_metro: string | null;
  job_company_location_region: string;
  job_company_location_geo: string;
  job_company_location_street_address: string | null;
  job_company_location_address_line_2: string | null;
  job_company_location_postal_code: string | null;
  job_company_location_country: string;
  job_company_location_continent: string;
  job_last_changed: string;
  job_last_verified: string;
  job_start_date: string;
  location_name: boolean;
  location_locality: boolean;
  location_metro: boolean;
  location_region: boolean;
  location_country: string;
  location_continent: string;
  location_street_address: boolean;
  location_address_line_2: string | null;
  location_postal_code: boolean;
  location_geo: boolean;
  location_last_updated: string;
  phone_numbers: boolean;
  emails: boolean;
  interests: string[];
  skills: string[];
  location_names: boolean;
  regions: boolean;
  countries: string[];
  street_addresses: boolean;
  experience: Experience[];
  education: Education[];
  profiles: SocialProfile[];
  dataset_version: string;
}

export interface Experience {
  company: Company;
  location_names: string[];
  end_date: string | null;
  start_date: string;
  title: JobTitle;
  is_primary: boolean;
}

export interface Company {
  name: string;
  size: string;
  id: string;
  founded: number | null;
  industry: string;
  location: Location;
  linkedin_url: string;
  linkedin_id: string;
  facebook_url: string | null;
  twitter_url: string | null;
  website: string | null;
}

export interface Location {
  name: string;
  locality: string;
  region: string;
  metro: string | null;
  country: string;
  continent: string;
  street_address: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  geo: string | null;
}

export interface JobTitle {
  name: string;
  class: string;
  role: string;
  sub_role: string;
  levels: string[];
}

export interface Education {
  school: School;
  degrees: string[];
  start_date: string;
  end_date: string;
  majors: string[];
  minors: string[];
  gpa: number | null;
}

export interface School {
  name: string;
  type: string;
  id: string;
  location: {
    name: string;
    locality: string;
    region: string;
    country: string;
    continent: string;
  };
  linkedin_url: string;
  facebook_url: string | null;
  twitter_url: string | null;
  linkedin_id: string;
  website: string;
  domain: string;
}

export interface SocialProfile {
  network: string;
  id: string;
  url: string;
  username: string;
}
