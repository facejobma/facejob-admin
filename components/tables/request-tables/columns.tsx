import { ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import "moment/locale/fr";
import { Badge } from "@/components/ui/badge";
import { EnterpriseData } from "@/types";
import { CellAction } from "./cell-action";
import { SafeLogo } from "@/components/ui/safe-logo";
import { CalendarDays, CheckCircle2, Clock3, Mail, Phone, XCircle } from "lucide-react";

const getStatus = (enterprise: EnterpriseData) => {
  if (enterprise.is_verified === true || enterprise.is_verified === "Accepted") {
    return { label: "Active", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" };
  }
  if (enterprise.is_verified === "Declined" || enterprise.comment) {
    return { label: "Refusée", icon: XCircle, className: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" };
  }
  return { label: "À examiner", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300" };
};

export const columns: ColumnDef<EnterpriseData>[] = [
  {
    accessorKey: "company_name",
    header: "Entreprise",
    cell: ({ row }) => {
      const enterprise = row.original;
      const companyName = enterprise.company_name || "Entreprise";
      const sectorName = enterprise.sector?.name || "Secteur non renseigné";
      return (
        <div className="flex min-w-[230px] items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
            <SafeLogo src={enterprise.logo} alt={`Logo de ${companyName}`} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{companyName}</p>
            <p className="truncate text-xs text-muted-foreground">{sectorName}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => (
      <div className="min-w-[220px] space-y-1.5 text-sm">
        <a href={`mailto:${row.original.email}`} className="flex items-center gap-2 text-foreground hover:text-primary">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="max-w-[190px] truncate">{row.original.email}</span>
        </a>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{row.original.phone || "Non renseigné"}</span>
        </div>
      </div>
    ),
  },
  {
    id: "plan",
    header: "Plan",
    cell: ({ row }) => <Badge variant="secondary" className="whitespace-nowrap font-normal">{row.original.plan?.name || "Gratuit"}</Badge>,
  },
  {
    accessorKey: "created_at",
    header: "Inscription",
    cell: ({ row }) => (
      <div className="flex min-w-[130px] items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{moment(row.original.created_at).format("DD MMM YYYY")}</p>
          <p className="text-xs text-muted-foreground">{moment(row.original.created_at).format("HH:mm")}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
    cell: ({ row }) => {
      const status = getStatus(row.original);
      const Icon = status.icon;
      return <Badge variant="outline" className={`${status.className} gap-1.5 whitespace-nowrap font-medium`}><Icon className="h-3.5 w-3.5" />{status.label}</Badge>;
    },
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
