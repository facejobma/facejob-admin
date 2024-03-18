import { NavItem } from "@/types";

export type User = {
  id: number;
  nomComplete: string;
  secteur: string;
  email: string;
  tel: string;
  bio: string;
};

export type Entreprise = {
  logo: string;
  id: number;
  company_name: string;
  secteur: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
  isVerified: string;
};

export type Job = {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  secteur_name: string;
  isVerified: string;
};

export type CV = {
  id: number;
  link: string;
  isVerified: string;
  candidat_name: string;
  secteur_name: string;
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
