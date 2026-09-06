"use client";
import { useEffect, useState, useCallback } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { CVRequests } from "@/components/tables/cv-tables/requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CV } from "@/types";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  LayoutDashboard,
  RefreshCw,
  Video,
  XCircle,
} from "lucide-react";

const breadcrumbItems = [
  { title: "Demandes", link: "/dashboard/candidate-videos" },
];

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 12,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
    has_more_pages: false,
  });
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        setError(null);
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        // Fetch all videos to allow filtering by status.
        // Build the query string separately and pass a plain relative path to
        // fetch() — new URL() requires an absolute URL (or a base arg) and
        // throws synchronously otherwise, which NEXT_PUBLIC_BACKEND_URL being
        // empty in production (relying on the next.config.js /api rewrite
        // instead) triggered every time, silently, since the catch below
        // didn't log anything.
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: pageSize.toString(),
        });
        if (statusFilter !== "all") params.set("status", statusFilter);

        const response = await fetch(
          `${backendUrl}/api/v1/admin/candidate-videos?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          throw new Error(
            `Impossible de charger les CV vidéo (${response.status}).`,
          );
        }
        const result = await response.json();

        // Extract the data array from the API response
        setUsers(result.data || []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
        if (result.stats) {
          setStats({
            total: Number(result.stats.total || 0),
            pending: Number(result.stats.pending || 0),
            accepted: Number(result.stats.accepted || 0),
            declined: Number(result.stats.declined || 0),
          });
        }
      } catch (error) {
        console.error("Failed to fetch candidate videos:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des données.",
        );
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      } finally {
        if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [authToken, currentPage, pageSize, statusFilter, toast],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setShowStatistics(
      localStorage.getItem("candidate-videos:show-statistics") === "true",
    );
    setShowActivity(
      localStorage.getItem("candidate-videos:show-activity") === "true",
    );
  }, []);

  const togglePanel = (panel: "statistics" | "activity") => {
    const setter = panel === "statistics" ? setShowStatistics : setShowActivity;
    const key = `candidate-videos:show-${panel}`;
    setter((current) => {
      localStorage.setItem(key, String(!current));
      return !current;
    });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const canGoPrevious = pagination.current_page > 1;
  const canGoNext = pagination.current_page < pagination.last_page;

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gestion des CV vidéo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultez, modérez et organisez les présentations vidéo des
            candidats.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchData(true)}
          disabled={isRefreshing}
          className="rounded-xl"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Actualisation…" : "Actualiser"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-2 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel("statistics")}
          className="gap-2"
        >
          <LayoutDashboard className="h-4 w-4" /> Statistiques
          {showStatistics ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePanel("activity")}
          className="gap-2"
        >
          <Activity className="h-4 w-4" /> Activité et répartition
          {showActivity ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
        {!showStatistics && !showActivity && (
          <span className="self-center px-2 text-xs text-muted-foreground">
            Panneaux masqués pour libérer l’espace de travail
          </span>
        )}
      </div>

      {showStatistics && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total",
              value: stats.total,
              detail: "CV vidéo reçus",
              icon: Video,
              color: "text-blue-600",
            },
            {
              label: "En attente",
              value: stats.pending,
              detail: "À examiner",
              icon: Clock3,
              color: "text-amber-600",
            },
            {
              label: "Acceptés",
              value: stats.accepted,
              detail: "CV validés",
              icon: CheckCircle2,
              color: "text-emerald-600",
            },
            {
              label: "Refusés",
              value: stats.declined,
              detail: "CV non validés",
              icon: XCircle,
              color: "text-red-600",
            },
          ].map(({ label, value, detail, icon: Icon, color }) => (
            <Card
              key={label}
              className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {value.toLocaleString("fr-FR")}
                </p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showActivity && (
        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Répartition de la modération
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            {[
              [
                "Taux de validation",
                stats.total
                  ? Math.round((stats.accepted / stats.total) * 100)
                  : 0,
              ],
              [
                "Taux en attente",
                stats.total
                  ? Math.round((stats.pending / stats.total) * 100)
                  : 0,
              ],
              [
                "Taux de refus",
                stats.total
                  ? Math.round((stats.declined / stats.total) * 100)
                  : 0,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl border bg-muted/30 p-4"
              >
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchData(true)}
            className="shrink-0 rounded-lg"
          >
            Réessayer
          </Button>
        </div>
      )}

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-lg">Répertoire des CV vidéo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sélectionnez une vue ou un statut, puis utilisez les actions pour
            modérer les vidéos.
          </p>
        </CardHeader>
        <Tabs value={statusFilter} onValueChange={handleStatusChange}>
          <div className="overflow-x-auto px-5 pt-4">
            <TabsList className="inline-flex h-auto min-w-full justify-start gap-1 p-1 sm:min-w-0">
              <TabsTrigger value="all">Tous ({stats.total})</TabsTrigger>
              <TabsTrigger value="Pending">
                En attente ({stats.pending})
              </TabsTrigger>
              <TabsTrigger value="Accepted">
                Acceptés ({stats.accepted})
              </TabsTrigger>
              <TabsTrigger value="Declined">
                Refusés ({stats.declined})
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={statusFilter} className="m-0">
            <CardContent className="space-y-5 p-5">
              <CVRequests
                data={users}
                onRefresh={() => fetchData(true)}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                serverPagination
              />
              {pagination.total > 0 && (
                <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pagination.from ?? 0}-{pagination.to ?? 0}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {pagination.total.toLocaleString()}
                    </span>{" "}
                    CV vidéo
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      Par page
                      <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        disabled={isRefreshing}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                      >
                        <option value={12}>12</option>
                        <option value={24}>24</option>
                        <option value={48}>48</option>
                        <option value={96}>96</option>
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
                        disabled={!canGoPrevious || isRefreshing}
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
                        disabled={!canGoPrevious || isRefreshing}
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
                        disabled={!canGoNext || isRefreshing}
                        title="Page suivante"
                        className="h-9 w-9"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(pagination.last_page)}
                        disabled={!canGoNext || isRefreshing}
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
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  );
}
