import { NavItem } from "@/types";

export type User = {
  id: number;
  nomComplete: string;
  sector: string;
  email: string;
  tel: string;
  bio: string;
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
};

export type Job = {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string;
  isVerified: string;
};

export type CV = {
  id: number;
  link: string;
  isVerified: string;
  candidat_name: string;
  sector_name: string;
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard"
  },
  {
    title: "Candidates",
    href: "/dashboard/candidate",
    icon: "user",
    label: "user"
  },
  {
    title: "Entreprises",
    href: "/dashboard/entreprise",
    icon: "employee",
    label: "employee"
  },
  {
    title: "Entreprise Review",
    href: "/dashboard/requests",
    icon: "request",
    label: "request"
  },
  {
    title: "Job Review",
    href: "/dashboard/jobs",
    icon: "jobReview",
    label: "jobReview"
  },
  {
    title: "Candidate Videos",
    href: "/dashboard/candidate-videos",
    icon: "candidateVideos",
    label: "candidateVideos"
  },
  {
    title: "Les ventes",
    href: "/dashboard/sales",
    icon: "sales",
    label: "sales"
  },
  {
    title: "Service de Payment",
    href: "/dashboard/payments",
    icon: "payments",
    label: "payments"
  },
  {
    title: "Logout",
    href: "/",
    icon: "logout",
    label: "logout"
  }
];
