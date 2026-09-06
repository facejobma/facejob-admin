"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Edit,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SafeLogo } from "@/components/ui/safe-logo";
import moment from "moment";
import "moment/locale/fr";

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string | null;
  company_name: string;
  company_logo?: string | null;
  sector_name: string | null;
  location?: string;
  contractType?: string;
  is_verified: string | boolean;
  status: "Pending" | "Accepted" | "Declined" | "Expired";
  created_at: string;
  updated_at?: string;
  job_name?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  experience_required?: number | null;
  benefits?: string[];
  required_languages?: string[];
  required_skills?: string[];
  applications_count?: number;
  views_count?: number;
}

const formatSalary = (job: JobData) => {
  const currency = job.currency || "MAD";
  if (job.salary_min != null && job.salary_max != null) {
    return `${Number(job.salary_min).toLocaleString("fr-FR")} – ${Number(job.salary_max).toLocaleString("fr-FR")} ${currency}`;
  }
  if (job.salary_min != null) {
    return `À partir de ${Number(job.salary_min).toLocaleString("fr-FR")} ${currency}`;
  }
  if (job.salary_max != null) {
    return `Jusqu’à ${Number(job.salary_max).toLocaleString("fr-FR")} ${currency}`;
  }
  return "Non renseigné";
};

export default function JobDetailPage() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Offres d'emploi", link: "/dashboard/jobs" },
    { title: "Détails", link: `/dashboard/jobs/${jobId}` },
  ];

  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        try {
          setLoading(true);
          setError(null);
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres_by_id/${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(
              `Erreur ${response.status}: ${response.statusText}`,
            );
          }

          const result = await response.json();
          setJobData(result.data);
        } catch (error) {
          console.error("Error fetching job data:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de la récupération des données.";
          setError(errorMessage);
          toast({
            title: "Erreur",
            variant: "destructive",
            description: errorMessage,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchJobData();
    }
  }, [jobId, toast]);

  const getStatusInfo = () => {
    if (!jobData) return { color: "gray", text: "Inconnu", icon: Clock };

    const isVerified = jobData.is_verified;

    if (jobData.status === "Expired") {
      return { color: "gray", text: "Expirée", icon: Calendar };
    } else if (isVerified === true || isVerified === "Accepted") {
      return { color: "green", text: "Publiée", icon: CheckCircle };
    } else if (isVerified === false || isVerified === "Declined") {
      return { color: "red", text: "Refusée", icon: XCircle };
    }
    return { color: "yellow", text: "En attente", icon: Clock };
  };

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
          <BreadCrumb items={breadcrumbItems} />

          {/* Skeleton pour l'en-tête */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Skeleton pour le contenu */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error || !jobData) {
    return (
      <ScrollArea className="h-full">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
          <BreadCrumb items={breadcrumbItems} />
          <Card className="border-red-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Erreur de chargement
                  </h3>
                  <p className="text-red-600">
                    {error || "Offre d'emploi introuvable"}
                  </p>
                </div>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const openPublicJob = () => {
    const frontendUrl = (
      process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin
    ).replace(/\/$/, "");
    window.open(
      `${frontendUrl}/offres/${jobId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* En-tête */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center gap-2">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/jobs/${jobId}/edit`)}
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Titre et statut */}
        <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white shadow-xl shadow-emerald-950/10">
          <CardHeader>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white">
                  <SafeLogo
                    src={jobData.company_logo}
                    alt={`Logo de ${jobData.company_name}`}
                    className="h-full w-full object-contain p-2"
                    fallbackClassName="h-7 w-7 text-slate-400"
                  />
                </div>
                <div className="min-w-0 space-y-2">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    {jobData.titre}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-emerald-50">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {jobData.company_name}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {jobData.sector_name}
                    </div>
                    {jobData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {jobData.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Badge
                className={`
                ${
                  statusInfo.color === "green"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : statusInfo.color === "red"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : statusInfo.color === "gray"
                        ? "bg-slate-100 text-slate-800 border-slate-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              `}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.text}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Informations détaillées */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Description */}
          <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description du poste
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobData.description ? (
                <div
                  className="prose prose-slate max-w-none break-words dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: jobData.description }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune description disponible.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 md:col-span-2">
            <CardHeader>
              <CardTitle>Critères de matching</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Métier</span>
                  <p className="font-medium">
                    {jobData.job_name || "Non renseigné"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Expérience requise</span>
                  <p className="font-medium">
                    {jobData.experience_required != null
                      ? `${jobData.experience_required} an(s)`
                      : "Non renseignée"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Salaire</span>
                  <p className="font-medium">{formatSalary(jobData)}</p>
                </div>
              </div>
              {[
                ["Langues", jobData.required_languages],
                ["Compétences", jobData.required_skills],
                ["Avantages", jobData.benefits],
              ].map(([label, values]) => (
                <div key={label as string}>
                  <p className="text-sm text-gray-500 mb-1">
                    {label as string}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(values) && values.length > 0 ? (
                      values.map((value) => <Badge key={value}>{value}</Badge>)
                    ) : (
                      <span className="text-sm">Non renseigné</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Informations temporelles */}
          <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Période d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobData.date_debut && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">
                      {moment(jobData.date_debut).format("DD MMMM YYYY")}
                    </p>
                  </div>
                </div>
              )}

              {jobData.date_fin && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">
                      {moment(jobData.date_fin).format("DD MMMM YYYY")}
                    </p>
                  </div>
                </div>
              )}

              {jobData.contractType && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Type de contrat</p>
                    <Badge variant="outline">{jobData.contractType}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informations système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">
                    {moment(jobData.created_at).format("DD MMMM YYYY à HH:mm")}
                  </p>
                </div>
              </div>

              {jobData.updated_at && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Dernière modification
                    </p>
                    <p className="font-medium">
                      {moment(jobData.updated_at).format(
                        "DD MMMM YYYY à HH:mm",
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">ID de l'offre</p>
                  <p className="font-medium font-mono">#{jobData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  router.push(`/dashboard/jobs/${jobId}/candidates`)
                }
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Voir les candidatures
              </Button>

              <Button
                onClick={() => router.push(`/dashboard/jobs/${jobId}/edit`)}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier l'offre
              </Button>

              {jobData.status === "Accepted" && (
                <Button onClick={openPublicJob} variant="outline">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Voir sur le site
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
