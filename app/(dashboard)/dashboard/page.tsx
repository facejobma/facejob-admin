"use client";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { RecentSales } from "@/components/recent-sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Statistiques } from "@/types";
import { SimpleBarChart } from "@/components/simple-bar-chart";
import { CandidateAccountsChart } from "@/components/candidate-accounts-chart";
import { VideoCvUploadsChart } from "@/components/video-cv-uploads-chart";
import { CandidateSectorsChart } from "@/components/candidate-sectors-chart";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { addDays, addMonths, addYears } from "date-fns";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type DurationPreset = "7d" | "30d" | "3m" | "6m" | "1y" | "custom";
type CandidateAccountStatus = "all" | "active" | "inactive";

const durationOptions: { label: string; value: DurationPreset }[] = [
  { label: "7 derniers jours", value: "7d" },
  { label: "30 derniers jours", value: "30d" },
  { label: "3 derniers mois", value: "3m" },
  { label: "6 derniers mois", value: "6m" },
  { label: "12 derniers mois", value: "1y" },
  { label: "Période personnalisée", value: "custom" },
];

const candidateStatusOptions: {
  label: string;
  value: CandidateAccountStatus;
}[] = [
  { label: "Tous les statuts", value: "all" },
  { label: "Actifs", value: "active" },
  { label: "Inactifs", value: "inactive" },
];

function getDateRangeFromPreset(preset: DurationPreset): DateRange {
  const today = new Date();

  switch (preset) {
    case "7d":
      return { from: addDays(today, -7), to: today };
    case "30d":
      return { from: addDays(today, -30), to: today };
    case "3m":
      return { from: addMonths(today, -3), to: today };
    case "6m":
      return { from: addMonths(today, -6), to: today };
    case "1y":
    case "custom":
    default:
      return { from: addYears(today, -1), to: today };
  }
}

function OverViewTab() {
  const [stats, setStats] = useState<Statistiques>({
    sectors_count: 0,
    postules_count: 0,
    offres_count: 0,
    candidates_count: 0,
    entreprises_count: 0,
    sales: [],
    candidates: [],
    video_cvs: [],
    candidate_sectors: [],
    entreprises: [],
    last_n_sales: [],
  });
  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addYears(new Date(), -1),
    to: new Date(),
  });
  const [durationPreset, setDurationPreset] = useState<DurationPreset>("1y");
  const [candidateChartDate, setCandidateChartDate] = React.useState<
    DateRange | undefined
  >({
    from: addYears(new Date(), -1),
    to: new Date(),
  });
  const [candidateChartPreset, setCandidateChartPreset] =
    useState<DurationPreset>("1y");
  const [candidateChartStatus, setCandidateChartStatus] =
    useState<CandidateAccountStatus>("all");
  const [candidateChartStats, setCandidateChartStats] = useState<
    Statistiques["candidates"]
  >([]);
  const [candidateChartLoading, setCandidateChartLoading] = useState(true);
  const [videoCvChartDate, setVideoCvChartDate] = React.useState<
    DateRange | undefined
  >({
    from: addYears(new Date(), -1),
    to: new Date(),
  });
  const [videoCvChartPreset, setVideoCvChartPreset] =
    useState<DurationPreset>("1y");
  const [videoCvChartStats, setVideoCvChartStats] = useState<
    Statistiques["video_cvs"]
  >([]);
  const [videoCvChartLoading, setVideoCvChartLoading] = useState(true);
  const { toast } = useToast();

  const authToken = Cookies.get("authToken");

  const handleDurationChange = (value: DurationPreset) => {
    setDurationPreset(value);

    if (value !== "custom") {
      setDate(getDateRangeFromPreset(value));
    }
  };

  const handleDateChange: React.Dispatch<
    React.SetStateAction<DateRange | undefined>
  > = (value) => {
    setDurationPreset("custom");
    setDate(value);
  };

  const handleCandidateChartDurationChange = (value: DurationPreset) => {
    setCandidateChartPreset(value);

    if (value !== "custom") {
      setCandidateChartDate(getDateRangeFromPreset(value));
    }
  };

  const handleCandidateChartDateChange: React.Dispatch<
    React.SetStateAction<DateRange | undefined>
  > = (value) => {
    setCandidateChartPreset("custom");
    setCandidateChartDate(value);
  };

  const handleVideoCvChartDurationChange = (value: DurationPreset) => {
    setVideoCvChartPreset(value);

    if (value !== "custom") {
      setVideoCvChartDate(getDateRangeFromPreset(value));
    }
  };

  const handleVideoCvChartDateChange: React.Dispatch<
    React.SetStateAction<DateRange | undefined>
  > = (value) => {
    setVideoCvChartPreset("custom");
    setVideoCvChartDate(value);
  };

  useEffect(() => {
    async function getStats() {
      if (!authToken) {
        toast({
          title: "Erreur d'authentification",
          variant: "destructive",
          description:
            "Token d'authentification manquant. Veuillez vous reconnecter.",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDashboardError(null);

        const rawBackend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const apiBase = rawBackend.replace(/\/api\/?$/, "");
        const apiUrl = `${apiBase}/api/v1/admin/statics?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API Error:", response.status, errorText);
          throw new Error(
            `Erreur API: ${response.status} - ${response.statusText}`,
          );
        }

        const result = await response.json();

        // Vérifier la structure de la réponse et fournir des valeurs par défaut
        const statsData = {
          sectors_count: result.sectors_count || 0,
          postules_count: result.postules_count || 0,
          offres_count: result.offres_count || 0,
          candidates_count: result.candidates_count || 0,
          entreprises_count: result.entreprises_count || 0,
          sales: Array.isArray(result.sales) ? result.sales : [],
          candidates: Array.isArray(result.candidates) ? result.candidates : [],
          video_cvs: Array.isArray(result.video_cvs) ? result.video_cvs : [],
          candidate_sectors: Array.isArray(result.candidate_sectors)
            ? result.candidate_sectors
            : [],
          entreprises: Array.isArray(result.entreprises)
            ? result.entreprises
            : [],
          last_n_sales: Array.isArray(result.last_n_sales)
            ? result.last_n_sales
            : [],
        };

        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);

        let errorMessage = "Erreur lors du chargement des statistiques.";

        if (error instanceof TypeError && error.message.includes("fetch")) {
          errorMessage =
            "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          title: "Erreur",
          variant: "destructive",
          description: errorMessage,
        });
        setDashboardError(errorMessage);

        // En cas d'erreur, on garde des valeurs par défaut pour éviter les crashes
        setStats({
          sectors_count: 0,
          postules_count: 0,
          offres_count: 0,
          candidates_count: 0,
          entreprises_count: 0,
          sales: [],
          candidates: [],
          video_cvs: [],
          candidate_sectors: [],
          entreprises: [],
          last_n_sales: [],
        });
      } finally {
        setLoading(false);
      }
    }

    getStats();
  }, [date?.from, date?.to, toast, authToken, reloadKey]);

  useEffect(() => {
    async function getCandidateChartStats() {
      if (!authToken) {
        setCandidateChartLoading(false);
        return;
      }

      try {
        setCandidateChartLoading(true);

        const params = new URLSearchParams();

        if (candidateChartDate?.from) {
          params.set("from", candidateChartDate.from.toISOString());
        }

        if (candidateChartDate?.to) {
          params.set("to", candidateChartDate.to.toISOString());
        }

        if (candidateChartStatus !== "all") {
          params.set("candidate_status", candidateChartStatus);
        }

        const rawBackend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const apiBase = rawBackend.replace(/\/api\/?$/, "");

        const response = await fetch(
          `${apiBase}/api/v1/admin/statics?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Erreur API: ${response.status} - ${response.statusText}`,
          );
        }

        const result = await response.json();
        setCandidateChartStats(
          Array.isArray(result.candidates) ? result.candidates : [],
        );
      } catch (error) {
        console.error("Error fetching candidate chart stats:", error);
        setCandidateChartStats([]);

        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Erreur lors du chargement du graphe des candidats.",
        });
      } finally {
        setCandidateChartLoading(false);
      }
    }

    getCandidateChartStats();
  }, [
    candidateChartDate?.from,
    candidateChartDate?.to,
    candidateChartStatus,
    authToken,
    toast,
  ]);

  useEffect(() => {
    async function getVideoCvChartStats() {
      if (!authToken) {
        setVideoCvChartLoading(false);
        return;
      }

      try {
        setVideoCvChartLoading(true);

        const params = new URLSearchParams();

        if (videoCvChartDate?.from) {
          params.set("from", videoCvChartDate.from.toISOString());
        }

        if (videoCvChartDate?.to) {
          params.set("to", videoCvChartDate.to.toISOString());
        }

        const rawBackend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const apiBase = rawBackend.replace(/\/api\/?$/, "");

        const response = await fetch(
          `${apiBase}/api/v1/admin/statics?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Erreur API: ${response.status} - ${response.statusText}`,
          );
        }

        const result = await response.json();
        setVideoCvChartStats(
          Array.isArray(result.video_cvs) ? result.video_cvs : [],
        );
      } catch (error) {
        console.error("Error fetching video CV chart stats:", error);
        setVideoCvChartStats([]);

        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Erreur lors du chargement du graphe des CV video.",
        });
      } finally {
        setVideoCvChartLoading(false);
      }
    }

    getVideoCvChartStats();
  }, [videoCvChartDate?.from, videoCvChartDate?.to, authToken, toast]);

  const statsCards = [
    {
      title: "Total des secteurs",
      value: stats.sectors_count,
      icon: Building2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total des candidatures",
      value: stats.postules_count,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Total d'offres",
      value: stats.offres_count,
      icon: Briefcase,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Nombre de candidats",
      value: stats.candidates_count,
      icon: FileText,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "Nombre d'entreprises",
      value: stats.entreprises_count,
      icon: TrendingUp,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-[1600px] flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                <ShieldCheck className="h-3.5 w-3.5" />
                Pilotage de la plateforme
              </div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Tableau de bord administrateur
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-50 sm:text-base">
                Supervisez les utilisateurs, les offres, les CV vidéo et
                l’activité commerciale depuis un espace centralisé.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard/requests"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Entreprises à valider
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/jobs"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
              >
                Offres à vérifier
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Période d’analyse
              </p>
              <p className="text-xs text-slate-500">
                Les indicateurs et graphiques suivent la période sélectionnée.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={durationPreset} onValueChange={handleDurationChange}>
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 sm:w-[210px] dark:border-slate-700 dark:bg-slate-950">
                <SelectValue placeholder="Choisir une durée" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CalendarDateRangePicker date={date} setDate={handleDateChange} />
          </div>
        </section>

        {dashboardError && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <span>{dashboardError}</span>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50 dark:bg-red-950 dark:text-red-200 dark:ring-red-900"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Réessayer
            </button>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800 lg:w-[420px]">
            <TabsTrigger value="overview">Aperçu général</TabsTrigger>
            <TabsTrigger value="analytics">Analyses détaillées</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {statsCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Card
                    key={card.title}
                    className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                      <CardTitle className="max-w-[150px] text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">
                        {card.title}
                      </CardTitle>
                      <div className={`rounded-xl p-2.5 ${card.bgColor}`}>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        {loading ? (
                          <span className="block h-9 w-20 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                        ) : (
                          card.value.toLocaleString("fr-FR")
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Évolution des CV vidéo téléversés
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nombre de CV vidéo ajoutés sur la période sélectionnée
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                      value={videoCvChartPreset}
                      onValueChange={handleVideoCvChartDurationChange}
                    >
                      <SelectTrigger className="w-full sm:w-[210px]">
                        <SelectValue placeholder="Choisir une durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <CalendarDateRangePicker
                      date={videoCvChartDate}
                      setDate={handleVideoCvChartDateChange}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {videoCvChartLoading ? (
                  <div className="flex h-[320px] items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Chargement des données...
                      </div>
                    </div>
                  </div>
                ) : (
                  <VideoCvUploadsChart stats={videoCvChartStats} />
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Top secteurs par nombre de candidats
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Les secteurs les plus représentés dans les profils candidats
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-[360px] items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Chargement des donnees...
                      </div>
                    </div>
                  </div>
                ) : (
                  <CandidateSectorsChart stats={stats.candidate_sectors} />
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Évolution des créations de comptes candidats
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Nombre de nouveaux comptes candidats sur la période
                      sélectionnée
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Select
                      value={candidateChartStatus}
                      onValueChange={(value) =>
                        setCandidateChartStatus(value as CandidateAccountStatus)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Statut du compte" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidateStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={candidateChartPreset}
                      onValueChange={handleCandidateChartDurationChange}
                    >
                      <SelectTrigger className="w-full sm:w-[210px]">
                        <SelectValue placeholder="Choisir une durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <CalendarDateRangePicker
                      date={candidateChartDate}
                      setDate={handleCandidateChartDateChange}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {candidateChartLoading ? (
                  <div className="flex h-[320px] items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <div className="text-gray-500 dark:text-gray-400">
                        Chargement des données...
                      </div>
                    </div>
                  </div>
                ) : (
                  <CandidateAccountsChart stats={candidateChartStats} />
                )}
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Évolution des ventes
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Revenus générés sur la période sélectionnée
                  </p>
                </CardHeader>
                <CardContent className="pl-2">
                  {loading ? (
                    <div className="flex items-center justify-center h-[350px]">
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <div className="text-gray-500 dark:text-gray-400">
                          Chargement des données...
                        </div>
                      </div>
                    </div>
                  ) : stats.sales && stats.sales.length > 0 ? (
                    <SimpleBarChart
                      unit={"DH "}
                      stats={stats.sales}
                      title="Graphique des Ventes"
                      color="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
                      <div className="text-center space-y-2">
                        <div className="text-lg">📊</div>
                        <div>Aucune donnée de vente disponible</div>
                        <div className="text-sm">
                          Les données apparaîtront ici une fois disponibles
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-3 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Ventes récentes
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dernières transactions effectuées
                  </p>
                </CardHeader>
                <CardContent>
                  {stats.last_n_sales && stats.last_n_sales.length > 0 ? (
                    <RecentSales sales={stats.last_n_sales} />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                      <div className="text-center space-y-2">
                        <div className="text-lg">💰</div>
                        <div>Aucune vente récente</div>
                        <div className="text-sm">
                          Les ventes récentes apparaîtront ici
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Nouvelles entreprises
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Évolution des inscriptions d&apos;entreprises
                  </p>
                </CardHeader>
                <CardContent className="pl-2">
                  {stats.entreprises && stats.entreprises.length > 0 ? (
                    <SimpleBarChart
                      stats={stats.entreprises}
                      title="Nouvelles Entreprises"
                      color="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
                      <div className="text-center space-y-2">
                        <div className="text-lg">🏢</div>
                        <div>Aucune donnée d&apos;entreprise disponible</div>
                        <div className="text-sm">
                          Les statistiques apparaîtront ici
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Nouveaux candidats
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Évolution des inscriptions de candidats
                  </p>
                </CardHeader>
                <CardContent className="pl-2">
                  {stats.candidates && stats.candidates.length > 0 ? (
                    <SimpleBarChart
                      stats={stats.candidates}
                      title="Nouveaux Candidats"
                      color="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-gray-500 dark:text-gray-400">
                      <div className="text-center space-y-2">
                        <div className="text-lg">👥</div>
                        <div>Aucune donnée de candidat disponible</div>
                        <div className="text-sm">
                          Les statistiques apparaîtront ici
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}

export default function page() {
  return <OverViewTab />;
}
