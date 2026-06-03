"use client";
import { ChangeEvent, useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { UserClient } from "@/components/tables/user-tables/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, TrendingUp, UserCheck, Users, UserX } from "lucide-react";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
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

  const fetchData = async (isRefresh = false) => {
    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description: "Token d'authentification manquant. Veuillez vous reconnecter.",
      });
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Vérifier que l'URL de l'API est définie
      if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
        throw new Error("URL de l'API non configurée");
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: pageSize.toString(),
      });
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/candidates?${params.toString()}`;

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
        throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
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
      console.error("Error fetching candidates:", error);
      
      let errorMessage = "Erreur lors de la récupération des candidats.";
      
      if (error instanceof TypeError && error.message.includes("fetch")) {
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur",
        variant: "destructive",
        description: errorMessage,
      });
      
      // En cas d'erreur, on garde un tableau vide pour éviter les crashes
      setUsers([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize]);

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

  const statsCards = [
    {
      title: "Total Candidats",
      value: totalCandidates,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Candidats Actifs",
      value: activeCandidates,
      icon: UserCheck,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Candidats Inactifs",
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
            <span className="text-muted-foreground">Chargement des candidats...</span>
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
            <p className="text-muted-foreground">Session expirée. Veuillez vous reconnecter.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-4 md:p-8 pt-6 overflow-x-hidden">
      <BreadCrumb items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Gestion des Candidats
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez et supervisez tous les candidats de la plateforme
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Candidates Table */}
      <div className="w-full">
        <Card className="w-full border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            {users.length === 0 ? (
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
                      Il n&apos;y a actuellement aucun candidat dans la base de données.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-hidden">
                <UserClient data={users} onRefresh={() => fetchData(true)} isRefreshing={refreshing} />
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
                      onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                      disabled={!canGoPrevious || refreshing}
                      title="Page précédente"
                      className="h-9 w-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((page) => Math.min(page + 1, pagination.last_page))}
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
