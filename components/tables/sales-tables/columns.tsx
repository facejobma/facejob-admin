import { ColumnDef } from "@tanstack/react-table";
import { Sales } from "@/types";
import moment from "moment";
import { CellAction } from "./cell-action";
import { SafeLogo } from "@/components/ui/safe-logo";
import { Building2, CalendarDays, Mail, MapPin, Phone } from "lucide-react";

const periodLabels: Record<string, string> = {
  monthly: "Mensuel",
  quarterly: "Trimestriel",
  annual: "Annuel",
};

const statusStyles: Record<string, { label: string; className: string }> = {
  Pending: {
    label: "En attente",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  Accepted: {
    label: "Acceptée",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  Rejected: {
    label: "Refusée",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  Declined: {
    label: "Refusée",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

export const columns: ColumnDef<Sales>[] = [
  {
    id: "request",
    header: "Demande",
    size: 135,
    cell: ({ row }) => (
      <div className="space-y-1 whitespace-nowrap">
        <p className="font-semibold text-gray-900">#{row.original.id}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {row.original.created_at
            ? moment(row.original.created_at).format("DD/MM/YYYY HH:mm")
            : "Date inconnue"}
        </p>
      </div>
    ),
  },
  {
    id: "enterprise",
    header: "Entreprise",
    size: 250,
    cell: ({ row }) => {
      const enterprise = row.original.entreprise;

      return (
        <div className="flex min-w-[230px] items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-50">
            <SafeLogo
              src={enterprise?.logo}
              alt={`Logo de ${enterprise?.company_name || "l'entreprise"}`}
              fallbackClassName="h-5 w-5 text-slate-400"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate font-semibold text-gray-900">
              {enterprise?.company_name ||
                `Entreprise #${row.original.entreprise_id}`}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {enterprise?.sector?.name || "Secteur non renseigné"}
            </p>
            {(enterprise?.city || enterprise?.adresse) && (
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {enterprise.city || enterprise.adresse}
              </p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "contact",
    header: "Contact",
    size: 240,
    cell: ({ row }) => {
      const enterprise = row.original.entreprise;

      return (
        <div className="min-w-[210px] space-y-1.5 text-sm">
          {enterprise?.email ? (
            <a
              href={`mailto:${enterprise.email}`}
              className="flex items-center gap-2 text-gray-700 hover:text-primary hover:underline"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{enterprise.email}</span>
            </a>
          ) : (
            <span className="text-muted-foreground">Email non renseigné</span>
          )}
          {enterprise?.phone ? (
            <a
              href={`tel:${enterprise.phone}`}
              className="flex items-center gap-2 text-gray-700 hover:text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {enterprise.phone}
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">
              Téléphone non renseigné
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "plan",
    header: "Plan demandé",
    size: 210,
    cell: ({ row }) => {
      const plan = row.original.plan;

      return (
        <div className="min-w-[180px] space-y-1">
          <p className="font-semibold text-gray-900">
            {plan?.name || `Plan #${row.original.plan_id}`}
          </p>
          <p className="text-xs text-muted-foreground">
            {periodLabels[row.original.payment_period] ||
              row.original.payment_period}
          </p>
          {plan && (
            <p className="text-xs text-muted-foreground">
              {plan.job_postings === -1
                ? "Offres illimitées"
                : `${plan.job_postings ?? 0} offre(s)`}
              {" · "}
              {plan.cv_video_consultations === -1
                ? "Accès CV illimités"
                : `${plan.cv_video_consultations ?? 0} accès CV`}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: "Montant",
    size: 110,
    cell: ({ row }) => (
      <div className="whitespace-nowrap font-semibold text-gray-900">
        {Number(row.original.price || 0).toFixed(2)} DH
      </div>
    ),
  },
  {
    id: "period",
    header: "Période prévue",
    size: 150,
    cell: ({ row }) => (
      <div className="whitespace-nowrap text-xs text-muted-foreground">
        <p>{moment(row.original.start_date).format("DD/MM/YYYY")}</p>
        <p>au {moment(row.original.end_date).format("DD/MM/YYYY")}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    size: 110,
    cell: ({ row }) => {
      const status = statusStyles[row.original.status] || {
        label: row.original.status,
        className: "border-slate-200 bg-slate-50 text-slate-700",
      };

      return (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
