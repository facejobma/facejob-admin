"use client";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { UserClient } from "@/components/tables/user-tables/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import Cookies from "js-cookie";

const breadcrumbItems = [{ title: "Candidats", link: "/dashboard/candidate" }];

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
};

type CandidateStats = {
  total: number;
  active: number;
  inactive: number;
  recent_30_days: number;
};

export default function CandidatesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingActive, setExportingActive] = useState(false);
  const [exportingInactive, setExportingInactive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
    has_more_pages: false,
  });
  const [stats, setStats] = useState<CandidateStats>({
    total: 0,
    active: 0,
    inactive: 0,
    recent_30_days: 0,
  });
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  const fetchData = async (isRefresh = false, signal?: AbortSignal) => {
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
      setError(null);
      const shouldShowPageLoader = !isRefresh && !hasLoadedRef.current;

      if (isRefresh || !shouldShowPageLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: pageSize.toString(),
      });

      if (searchQuery) {
        params.set("search", searchQuery);
      }
      if (statusFilter) params.set("status", statusFilter);
      if (sectorFilter) params.set("sector", sectorFilter);

      const apiUrl = `/api/v1/admin/candidates?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(
          `Erreur API: ${response.status} - ${response.statusText}`,
        );
      }

      const result = await response.json();

      // Vérifier la structure de la réponse
      if (result && Array.isArray(result.data)) {
        setUsers(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
        if (result.stats) {
          setStats({
            total: Number(result.stats.total || 0),
            active: Number(result.stats.active || 0),
            inactive: Number(result.stats.inactive || 0),
            recent_30_days: Number(result.stats.recent_30_days || 0),
          });
        }
        if (Array.isArray(result.filters?.sectors)) {
          setSectorOptions(result.filters.sectors);
        }
      } else if (Array.isArray(result)) {
        setUsers(result);
        setPagination({
          current_page: 1,
          per_page: result.length,
          total: result.length,
          last_page: 1,
          from: result.length > 0 ? 1 : null,
          to: result.length > 0 ? result.length : null,
          has_more_pages: false,
        });
      } else {
        console.warn("Structure de réponse inattendue:", result);
        setUsers([]);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Error fetching candidates:", error);

      let errorMessage = "Erreur lors de la récupération des candidats.";

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
      setError(errorMessage);

      // Conserver les résultats déjà visibles lors d'une erreur de rafraîchissement.
      if (!hasLoadedRef.current) {
        setUsers([]);
      }
    } finally {
      if (signal?.aborted) return;
      hasLoadedRef.current = true;

      if (isRefresh || !loading) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchData(false, controller.signal);
    return () => controller.abort();
  }, [currentPage, pageSize, searchQuery, statusFilter, sectorFilter]);

  // Calculer les statistiques
  const totalCandidates = stats.total;
  const activeCandidates = stats.active;
  const inactiveCandidates = stats.inactive;
  const recentCandidates = stats.recent_30_days;
  const canGoPrevious = pagination.current_page > 1;
  const canGoNext = pagination.current_page < pagination.last_page;

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback(
    (value: string) => {
      if (value === searchQuery) {
        return;
      }

      setSearchQuery(value);
      setCurrentPage(1);
    },
    [searchQuery],
  );

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleSectorChange = useCallback((value: string) => {
    setSectorFilter(value);
    setCurrentPage(1);
  }, []);

  const exportInactiveCandidates = async () => {
    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description:
          "Token d'authentification manquant. Veuillez vous reconnecter.",
      });
      return;
    }

    try {
      setExportingInactive(true);

      const response = await fetch("/api/admin/candidates/inactive/export", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erreur API: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `candidats_non_actifs_${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "La liste des candidats non actifs a été exportée.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'export.",
      });
    } finally {
      setExportingInactive(false);
    }
  };

  const exportActiveCandidates = async () => {
    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description:
          "Token d'authentification manquant. Veuillez vous reconnecter.",
      });
      return;
    }

    try {
      setExportingActive(true);

      const response = await fetch("/api/admin/candidates/active/export", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Erreur API: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `candidats_actifs_${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "La liste des candidats actifs a été exportée.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'export.",
      });
    } finally {
      setExportingActive(false);
    }
  };

  const statsCards = [
    {
      title: "Total des candidats",
      value: totalCandidates,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Candidats actifs",
      value: activeCandidates,
      icon: UserCheck,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Candidats inactifs",
      value: inactiveCandidates,
      icon: UserX,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Nouveaux (30j)",
      value: recentCandidates,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <span className="text-muted-foreground">
              Chargement des candidats...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur si pas de token
  if (!authToken) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Session expirée. Veuillez vous reconnecter.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 overflow-x-hidden p-4 sm:p-6 lg:p-8">
      <BreadCrumb items={breadcrumbItems} />

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gestion des utilisateurs
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Candidats
            </h1>
            <p className="mt-2 text-sm leading-6 text-emerald-50 sm:text-base">
              Recherchez, contrôlez et administrez les comptes candidats de la
              plateforme.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={exportActiveCandidates}
              disabled={exportingActive || activeCandidates === 0}
              className="h-11 gap-2 rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Download className="h-4 w-4" />
              {exportingActive ? "Export..." : "Exporter actifs"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportInactiveCandidates}
              disabled={exportingInactive || inactiveCandidates === 0}
              className="h-11 gap-2 rounded-xl border-white/20 bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
            >
              <Download className="h-4 w-4" />
              {exportingInactive ? "Export..." : "Exporter non actifs"}
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          <span>{error}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void fetchData(true)}
            disabled={refreshing}
            className="shrink-0 gap-2 rounded-xl bg-white"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Réessayer
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="min-w-0 rounded-2xl border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <CardTitle className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </CardTitle>
                <div className={`shrink-0 rounded-xl p-2.5 ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                  {card.value.toLocaleString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Candidates Table */}
      <div className="w-full">
        <Card className="w-full overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base text-slate-900 dark:text-white">
                  Annuaire des candidats
                </CardTitle>
                <p className="mt-1 text-xs text-slate-500">
                  La recherche et les filtres s’appliquent désormais à
                  l’ensemble de la base.
                </p>
              </div>
              {refreshing && (
                <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Actualisation
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {users.length === 0 &&
            !searchQuery &&
            !statusFilter &&
            !sectorFilter ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Aucun candidat trouvé
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Il n&apos;y a actuellement aucun candidat dans la base de
                      données.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-hidden">
                <UserClient
                  data={users}
                  onRefresh={() => fetchData(true)}
                  isRefreshing={refreshing}
                  onSearchChange={handleSearchChange}
                  onSectorChange={handleSectorChange}
                  onStatusChange={handleStatusChange}
                  sectorOptions={sectorOptions}
                />
              </div>
            )}
            {pagination.total > 0 && (
              <div className="mt-6 flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pagination.from ?? 0}-{pagination.to ?? 0}
                  </span>{" "}
                  sur{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pagination.total.toLocaleString()}
                  </span>{" "}
                  candidats
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    Par page
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      disabled={refreshing}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="min-w-[112px] text-center text-sm text-muted-foreground">
                      Page{" "}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {pagination.current_page}
                      </span>{" "}
                      / {pagination.last_page || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(1)}
                      disabled={!canGoPrevious || refreshing}
                      title="Première page"
                      className="h-9 w-9"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={!canGoPrevious || refreshing}
                      title="Page précédente"
                      className="h-9 w-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(page + 1, pagination.last_page),
                        )
                      }
                      disabled={!canGoNext || refreshing}
                      title="Page suivante"
                      className="h-9 w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(pagination.last_page)}
                      disabled={!canGoNext || refreshing}
                      title="Dernière page"
                      className="h-9 w-9"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
