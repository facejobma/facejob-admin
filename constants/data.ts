
import { NavItem } from "@/types";

export type User = {
  id: number;
  nomComplete: string;
  secteur: string;
  email: string;
  tel: string;
  bio: string;
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
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
