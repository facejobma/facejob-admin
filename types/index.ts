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
  amount: string;
  created_at: string;
  description: string;
  entreprise: EnterpriseData;
  id: number;
  plan_id: number;
  updated_at: string;
}

export type StatsItem = {
  sum: number;
  month: number;
  year: number;
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
  last_n_sales: Sales[];
}


export interface EnterpriseData {
  entreprise_logo: string;
  company_name: string;
  sector: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
  is_verified: string;
  plan_name: string;
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