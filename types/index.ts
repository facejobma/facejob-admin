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



export interface Statistiques{
  secteurs: number;
  postules: number;
  users: number;
  offres: number;
  entreprises: number;
}
