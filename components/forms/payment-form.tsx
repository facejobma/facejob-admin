import {
  Building2,
  CalendarDays,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { SafeLogo } from "@/components/ui/safe-logo";
import { PaymentDetail } from "@/types";
import React from "react";
import moment from "moment";

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

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) => {
  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">
        {hasValue ? value : "Non renseigné"}
      </span>
    </div>
  );
};

export const PaymentForm: React.FC<{ initialData: PaymentDetail }> = ({
  initialData,
}) => {
  const enterprise = initialData.entreprise;
  const plan = initialData.plan;
  const status = statusStyles[initialData.status] || {
    label: initialData.status,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };
  const website = enterprise?.site_web
    ? enterprise.site_web.match(/^https?:\/\//i)
      ? enterprise.site_web
      : `https://${enterprise.site_web}`
    : null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50">
            <SafeLogo
              src={enterprise?.logo}
              alt={`Logo de ${enterprise?.company_name || "l'entreprise"}`}
              fallbackClassName="h-8 w-8 text-slate-400"
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Demande #{initialData.id}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {enterprise?.company_name ||
                `Entreprise #${initialData.entreprise_id}`}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Envoyée le{" "}
              {moment(initialData.created_at).format("DD/MM/YYYY à HH:mm")}
            </p>
          </div>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1.5 text-sm font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-primary" /> Informations de
            l’entreprise
          </h2>
          <DetailRow
            label="Email"
            value={
              enterprise?.email && (
                <a
                  href={`mailto:${enterprise.email}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" /> {enterprise.email}
                </a>
              )
            }
          />
          <DetailRow
            label="Téléphone"
            value={
              enterprise?.phone && (
                <a
                  href={`tel:${enterprise.phone}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" /> {enterprise.phone}
                </a>
              )
            }
          />
          <DetailRow label="Secteur" value={enterprise?.sector?.name} />
          <DetailRow
            label="Localisation"
            value={
              (enterprise?.city || enterprise?.adresse) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />{" "}
                  {enterprise.city || enterprise.adresse}
                </span>
              )
            }
          />
          <DetailRow
            label="Effectif"
            value={
              enterprise?.effectif && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {enterprise.effectif}
                </span>
              )
            }
          />
          <DetailRow
            label="Site web"
            value={
              website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Ouvrir <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )
            }
          />
          <DetailRow label="Forme juridique" value={enterprise?.legal_form} />
          <DetailRow label="ICE" value={enterprise?.ice_number} />
          <DetailRow label="RC" value={enterprise?.rc_number} />
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Abonnement demandé</h2>
          <DetailRow
            label="Plan"
            value={plan?.name || `Plan #${initialData.plan_id}`}
          />
          <DetailRow
            label="Montant"
            value={`${Number(initialData.price || 0).toFixed(2)} DH`}
          />
          <DetailRow
            label="Période"
            value={
              periodLabels[initialData.payment_period] ||
              initialData.payment_period
            }
          />
          <DetailRow
            label="Début prévu"
            value={moment(initialData.start_date).format("DD/MM/YYYY")}
          />
          <DetailRow
            label="Fin prévue"
            value={moment(initialData.end_date).format("DD/MM/YYYY")}
          />
          <DetailRow
            label="Publications d’offres"
            value={
              plan?.job_postings === -1 ? "Illimitées" : plan?.job_postings
            }
          />
          <DetailRow
            label="Accès aux CV vidéo"
            value={
              plan?.cv_video_consultations === -1
                ? "Illimités"
                : plan?.cv_video_consultations
            }
          />
          <DetailRow label="Description du plan" value={plan?.description} />
        </section>
      </div>

      {enterprise?.description && (
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">
            Présentation de l’entreprise
          </h2>
          <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
            {enterprise.description}
          </p>
        </section>
      )}
    </div>
  );
};
