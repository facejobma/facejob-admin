import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Tableau de Bord",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard"
  },
  {
    title: "Candidats",
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
    title: "Entreprises Review",
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
    title: "Vidéos Candidats",
    href: "/dashboard/candidate-videos",
    icon: "candidateVideos",
    label: "candidateVideos"
  },
  {
    title: "Ventes",
    href: "/dashboard/sales",
    icon: "sales",
    label: "sales"
  },
  // {
  //   title: "Service de Payment",
  //   href: "/dashboard/payments",
  //   icon: "payments",
  //   label: "payments"
  // },
  {
    title: "Déconnexion",
    href: "/",
    icon: "logout",
    label: "logout"
  }
];
