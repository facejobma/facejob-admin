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
  entreprise_id: string;
  entreprise_name: string;
  entreprise_logo: string;
  id: number;
  plan_id: number;
  updated_at: string;
}

export interface Statistiques {
  sectors: number;
  postules: number;
  users: number;
  offres: number;
  entreprises: number;
  sales: Sales[];
}

// export enum Plan {
//   PannelGratuit = "Pannel gratuit",
//   PannelDeBase = "Pannel de base",
//   PannelIntermediaire = "Pannel Intérmédiaire",
//   PannelEssentiel = "Pannel Essentiel",
//   PannelPremium = "Pannel Premium"
// }

export interface EnterpriseData {
  logo: string;
  company_name: string;
  sector: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
  isVerified: string;
  plan_name: string;
  // plan_end_data: Date;
  // plan: Plan;
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