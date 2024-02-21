
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
  id: number;
  company_name: string;
  secteur: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Candidates",
    href: "/dashboard/candidate",
    icon: "user",
    label: "user",
  },
  {
    title: "Entreprises",
    href: "/dashboard/entreprise",
    icon: "employee",
    label: "employee",
  },
  {
    title: "Logout",
    href: "/",
    icon: "logout",
    label: "logout",
  },
];
