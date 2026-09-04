import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Candidats",
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
    title: "Validation des entreprises",
    href: "/dashboard/requests",
    icon: "request",
    label: "request",
  },
  {
    title: "Validation des offres",
    href: "/dashboard/jobs",
    icon: "jobReview",
    label: "jobReview",
  },
  {
    title: "CV vidéo",
    href: "/dashboard/candidate-videos",
    icon: "candidateVideos",
    label: "candidateVideos",
  },
  {
    title: "Campagnes e-mail",
    href: "/dashboard/email-campaigns",
    icon: "mail",
    label: "emailCampaigns",
  },
  {
    title: "Ventes",
    href: "/dashboard/sales",
    icon: "sales",
    label: "sales",
  },
  {
    title: "Fonctionnalités IA",
    href: "/dashboard/ai-features",
    icon: "settings",
    label: "aiFeatures",
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
    label: "logout",
  },
];
