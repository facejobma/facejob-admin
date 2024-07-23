import { NavItem } from "@/types";

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
  // {
  //   title: "Service de Payment",
  //   href: "/dashboard/payments",
  //   icon: "payments",
  //   label: "payments"
  // },
  {
    title: "Logout",
    href: "/",
    icon: "logout",
    label: "logout"
  }
];
