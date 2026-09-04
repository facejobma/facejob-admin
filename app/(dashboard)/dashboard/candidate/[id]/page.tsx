"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Video,
} from "lucide-react";

import BreadCrumb from "@/components/breadcrumb";
import { CVRequests } from "@/components/tables/cv-tables/requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CV, User as UserType } from "@/types";

type CandidateDetails = UserType & {
  address?: string | null;
  adresse?: string | null;
  availability_status?: string | null;
  image?: string | null;
  ville?: string | null;
  years_of_experience?: number | null;
};

const formatDate = (value?: string | null, withTime = false) => {
  if (!value) return "Non renseignée";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non renseignée";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
};

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() ||
  "C";

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const candidateId = params?.id;
  const authToken = Cookies.get("authToken");

  const [candidate, setCandidate] = useState<CandidateDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateVideos, setCandidateVideos] = useState<CV[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [videosRefreshing, setVideosRefreshing] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [videosViewMode, setVideosViewMode] = useState<"table" | "cards">(
    "cards",
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: "Candidats", link: "/dashboard/candidate" },
      { title: "Détails", link: `/dashboard/candidate/${candidateId}` },
    ],
    [candidateId],
  );

  const fetchCandidate = useCallback(
    async (signal?: AbortSignal) => {
      if (!authToken || !candidateId) {
        setError("Votre session administrateur est absente ou expirée.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/admin/candidate/${candidateId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            payload?.message ||
              (response.status === 404
                ? "Ce candidat n’existe pas ou a été supprimé."
                : "Impossible de charger ce candidat."),
          );
        }
        setCandidate((payload?.data || payload) as CandidateDetails);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        )
          return;
        setCandidate(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Impossible de charger ce candidat.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [authToken, candidateId],
  );

  const fetchCandidateVideos = useCallback(
    async (isRefresh = false, signal?: AbortSignal) => {
      if (!authToken || !candidateId) {
        setVideosLoading(false);
        return;
      }
      try {
        isRefresh ? setVideosRefreshing(true) : setVideosLoading(true);
        setVideosError(null);
        const response = await fetch(
          `/api/v1/admin/candidate/${candidateId}/videos`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            signal,
          },
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            payload?.message || "Impossible de charger les CV vidéo.",
          );
        }
        setCandidateVideos(Array.isArray(payload?.data) ? payload.data : []);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        )
          return;
        setVideosError(
          caughtError instanceof Error
            ? caughtError.message
            : "Impossible de charger les CV vidéo.",
        );
        if (!isRefresh) setCandidateVideos([]);
      } finally {
        if (!signal?.aborted) {
          setVideosLoading(false);
          setVideosRefreshing(false);
        }
      }
    },
    [authToken, candidateId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchCandidate(controller.signal);
    void fetchCandidateVideos(false, controller.signal);
    return () => controller.abort();
  }, [fetchCandidate, fetchCandidateVideos]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Chargement impossible",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">
              Chargement du candidat…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <div className="rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-950/40">
              <UserRound className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
              Candidat indisponible
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error || "Ce candidat n’existe pas ou n’est plus accessible."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/candidate")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
              </Button>
              <Button
                onClick={() => void fetchCandidate()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  const candidateName =
    candidate.first_name && candidate.last_name
      ? `${candidate.first_name} ${candidate.last_name}`
      : candidate.nomComplete || "Nom non renseigné";
  const isActive = candidate.is_active !== false;
  const isEmailVerified = Boolean(candidate.email_verified_at);
  const sectorName =
    candidate.job?.sector?.name ||
    (typeof candidate.sector === "object"
      ? candidate.sector?.name
      : candidate.sector) ||
    "Non renseigné";
  const location =
    candidate.ville ||
    candidate.address ||
    candidate.adresse ||
    "Non renseignée";
  const availability =
    candidate.availability_status === "available"
      ? "Disponible"
      : candidate.availability_status === "unavailable"
        ? "Indisponible"
        : "Non renseignée";
  const details = [
    { label: "E-mail", value: candidate.email || "Non renseigné", icon: Mail },
    {
      label: "Téléphone",
      value: candidate.tel || candidate.phone || "Non renseigné",
      icon: Phone,
    },
    { label: "Localisation", value: location, icon: MapPin },
    {
      label: "Métier ciblé",
      value: candidate.job?.name || "Non renseigné",
      icon: BriefcaseBusiness,
    },
    { label: "Secteur", value: sectorName, icon: BriefcaseBusiness },
    {
      label: "Contrat préféré",
      value: candidate.preferred_contract_type || "Non renseigné",
      icon: FileText,
    },
    {
      label: "Expérience",
      value:
        candidate.years_of_experience != null
          ? `${candidate.years_of_experience} an${candidate.years_of_experience > 1 ? "s" : ""}`
          : "Non renseignée",
      icon: CalendarDays,
    },
    { label: "Disponibilité", value: availability, icon: Clock3 },
  ];

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/candidate")}
            className="rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <Button
            onClick={() =>
              router.push(`/dashboard/candidate/${candidateId}/edit`)
            }
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
          >
            <Edit3 className="mr-2 h-4 w-4" /> Modifier
          </Button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/15 text-2xl font-bold shadow-inner">
            {candidate.image && /^https?:\/\//i.test(candidate.image) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={candidate.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(candidate.first_name, candidate.last_name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                {candidateName}
              </h1>
              <Badge
                className={
                  isActive
                    ? "border-emerald-200/30 bg-emerald-300/20 text-emerald-50"
                    : "border-white/20 bg-white/10 text-white"
                }
              >
                {isActive ? (
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <Clock3 className="mr-1 h-3.5 w-3.5" />
                )}
                {isActive ? "Compte actif" : "Compte inactif"}
              </Badge>
            </div>
            <p className="mt-2 break-words text-emerald-50">
              {candidate.job?.name || sectorName}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-emerald-50/90">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Inscrit le{" "}
                {formatDate(candidate.created_at)}
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {isEmailVerified ? "E-mail vérifié" : "E-mail non vérifié"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Video className="h-4 w-4" /> {candidateVideos.length} CV vidéo
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base">
              Informations du candidat
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            {details.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex min-w-0 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {String(value)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-emerald-600" /> À propos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
              {candidate.bio ||
                "Aucune biographie renseignée pour ce candidat."}
            </p>
            <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
              Dernière mise à jour : {formatDate(candidate.updated_at, true)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-5 sm:p-6">
          {videosError && (
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <span>{videosError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchCandidateVideos(true)}
                disabled={videosRefreshing}
                className="shrink-0 rounded-lg bg-white dark:bg-slate-900"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${videosRefreshing ? "animate-spin" : ""}`}
                />
                Réessayer
              </Button>
            </div>
          )}
          <CVRequests
            data={candidateVideos}
            onRefresh={() => void fetchCandidateVideos(true)}
            isLoading={videosLoading}
            isRefreshing={videosRefreshing}
            viewMode={videosViewMode}
            onViewModeChange={setVideosViewMode}
            title={`CV vidéo (${candidateVideos.length})`}
          />
        </CardContent>
      </Card>
    </main>
  );
}
