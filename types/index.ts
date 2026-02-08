import { Icons } from "@/components/icons";


export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}


export type Sales = {
  id: number;
  price: string;
  start_date: string;
  end_date: string;
  payment_method: string;
  reference: string;
  payment_period: string;
  status: string;
  contact_access_consumed: number;
  created_at?: string;
  updated_at?: string;
}

export type StatsItem = {
  sum: number;
  month: number;
  year: number;
}





export type Sale ={
  id: number;
  entreprise_id: number;
  amount: string; // ou number si tu convertis
  description: string;
  plan_id: number;
  sector_id: number | null;
  created_at: string; // ou Date si tu parsers
  updated_at: string; // ou Date si tu parsers
  plan: Plan;
  entreprise: Entreprise;
  sector: Sector | null;
}

export type PaymentDetail = {
  id: number;
  amount: string;
  price: string;
  start_date: string;
  end_date: string;
  payment_method: string;
  reference: string;
  payment_period: string;
  status: string;
  contact_access_consumed: number;
  job_posted: number;
  entreprise_id: number;
  plan_id: number;
  created_at: string;
  updated_at: string;
  plan: Plan;
  entreprise: EnterpriseData;
}

export interface Statistiques {
  sectors_count: number;
  postules_count: number;
  offres_count: number;
  candidates: StatsItem[];
  candidates_count: number;
  entreprises: StatsItem[];
  entreprises_count: number;
  sales: StatsItem[];
  last_n_sales: Sale[];
}


export interface EnterpriseData {
  id: number;
  logo: string;
  company_name: string;
  sector: Sector;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: number | string;
  description: string;
  is_verified: boolean | string;
  is_validated?: boolean;
  plan: Plan | null;
  created_at: string;
  city?: string;
  linkedin?: string;
  founded_year?: number;
  legal_form?: string;
  ice_number?: string;
  rc_number?: string;
}

export interface Sector {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}


export type PlanDetails = {
  id: number;
  name: string;
  description: string;
  monthly_price: number;
  quarterly_price: number;
  annual_price: number;
  account_creation_included: number;
  cv_video_access: number;
  cv_video_consultations: number;
  job_postings: number;
  dedicated_support: number;
  created_at: string;
  updated_at: string;
  popular: boolean;
  exclusive: boolean;
  isMonthly: boolean;
  isYearly: boolean;
  isQuarterly: boolean;
}

export type Plan = {
  id: number;
  name: string;
  description: string;
  monthly_price: number;
  quarterly_price: number;
  annual_price: number;
    company_name: string;
  entreprise_logo: string;
}

export type User = {
  id: number;
  nomComplete?: string;
  first_name?: string;
  last_name?: string;
  sector: Sector | string;
  email: string;
  tel?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
};
export type EntrepriseStatus = "Pending" | "Accepted" | "Declined"

export type Entreprise = {
  logo: string;
  id: number;
  company_name: string;
  sector: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: number;
  description: string;
  is_verified: EntrepriseStatus;
  plan_start_data: Date;
  plan_end_data: Date;
  created_at: string;
  updated_at: string;
  plan_name: string;
  entreprise_logo: string;
};

export type Job = {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string; // Changed from secteur_name
  sector_id: number;
  job_name: string;
  job_id: number;
  entreprise_id: number;
  is_verified: boolean | string; // Support both boolean and string
  contractType?: string;
  location?: string;
  created_at: string;
};


export type CV = {
  id: number;
  link: string;
  is_verified: string;
  candidat_name: string;
  secteur_name: string;
  created_at: string;
};