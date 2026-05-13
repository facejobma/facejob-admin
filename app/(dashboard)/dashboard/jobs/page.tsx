"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { JobRequests } from "@/components/tables/job-tables/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCw,
  Download,
  Calendar,
  Building2,
  BarChart3,
  Activity,
  MapPin,
  Users,
  LayoutGrid,
  List
} from "lucide-react";
import { Job } from "@/types";

const breadcrumbItems = [{ title: "Offres d'emploi", link: "/dashboard/jobs" }];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards"); // Cards par défaut
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [, forceUpdate] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter state
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  
  // Global statistics state
  const [globalStats, setGlobalStats] = useState({
    pending: 0,
    accepted: 0,
    declined: 0,
    total: 0,
  });
  
  const { toast } = useToast();
  const router = useRouter();
  const authToken = Cookies.get("authToken");

  // Check authentication on mount
  useEffect(() => {
    if (!authToken) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder à cette page.",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [authToken, router, toast]);

  // Minimum time between requests (5 seconds)
  const MIN_FETCH_INTERVAL = 5000;

  const fetchData = async (showRefreshToast = false) => {
    // Check if token exists
    if (!authToken) {
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter.",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    // Check if enough time has passed since last fetch
    const now = Date.now();
    if (now - lastFetchTime < MIN_FETCH_INTERVAL && showRefreshToast) {
      const remainingTime = Math.ceil((MIN_FETCH_INTERVAL - (now - lastFetchTime)) / 1000);
      toast({
        title: "Actualisation trop fréquente",
        description: `Veuillez attendre ${remainingTime} seconde${remainingTime > 1 ? 's' : ''} avant de réactualiser.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setRefreshing(true);
      if (!showRefreshToast) setLoading(true);
      setError(null);
      setLastFetchTime(now);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: pageSize.toString(),
      });
      
      // Add filters only if they're not default values
      if (statusFilter !== "all") {
        params.append('status', statusFilter);
      }
      if (sectorFilter !== "all") {
        params.append('sector', sectorFilter);
      }
      if (searchValue) {
        params.append('search', searchValue);
      }
      
      // Fetch paginated data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Handle 401 Unauthorized - redirect to login
      if (response.status === 401) {
        // Clear invalid tokens
        Cookies.remove("authToken");
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        
        toast({
          title: "Session expirée",
          description: "Votre session a expiré. Veuillez vous reconnecter.",
          variant: "destructive",
        });
        
        router.push("/");
        return;
      }

      if (response.status === 429) {
        // Rate limit exceeded - wait and retry
        const retryAfter = response.headers.get('Retry-After') || '5';
        const waitTime = parseInt(retryAfter) * 1000;
        
        toast({
          title: "Limite de requêtes atteinte",
          description: `Nouvelle tentative dans ${retryAfter} secondes...`,
          variant: "destructive",
        });
        
        // Wait and retry
        setTimeout(() => {
          fetchData(showRefreshToast);
        }, waitTime);
        return;
      }

      if (response.status === 400) {
        // Check if it's a security-related error
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error_code === 'CLIENT_ERROR' && errorData.message?.includes('Suspicious activity')) {
          toast({
            title: "Accès temporairement restreint",
            description: "Activité suspecte détectée. Veuillez réessayer dans quelques minutes.",
            variant: "destructive",
          });
          
          // Wait longer for security restrictions
          setTimeout(() => {
            fetchData(showRefreshToast);
          }, 30000); // Wait 30 seconds
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setJobs(result.data || []);
      
      // Update pagination metadata
      if (result.pagination) {
        setTotalItems(result.pagination.total);
        setTotalPages(result.pagination.last_page);
      }
      
      // Fetch global statistics (without filters)
      fetchGlobalStats();
      
      if (showRefreshToast) {
        toast({
          title: "Données actualisées",
          description: "Les offres d'emploi ont été mises à jour avec succès.",
        });
      }
    } catch (error) {
      console.error("Jobs fetch error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la récupération des données.";
      setError(errorMessage);
      
      // Don't show toast for rate limit errors as we handle them above
      if (!errorMessage.includes('429')) {
        toast({
          title: "Erreur",
          variant: "destructive",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch global statistics for tabs
  const fetchGlobalStats = async () => {
    try {
      // Fetch counts for each status
      const [pendingRes, acceptedRes, declinedRes, totalRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres?status=Pending&per_page=1`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres?status=Accepted&per_page=1`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres?status=Declined&per_page=1`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        }),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres?status=all&per_page=1`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        }),
      ]);

      const [pending, accepted, declined, total] = await Promise.all([
        pendingRes.json(),
        acceptedRes.json(),
        declinedRes.json(),
        totalRes.json(),
      ]);

      setGlobalStats({
        pending: pending.pagination?.total || 0,
        accepted: accepted.pagination?.total || 0,
        declined: declined.pagination?.total || 0,
        total: total.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching global stats:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authToken, currentPage, pageSize, statusFilter, sectorFilter, searchValue]);

  // Fonction optimisée pour mettre à jour une seule offre
  const updateSingleJob = async (jobId: number, newStatus?: string) => {
    try {
      // Si on a le nouveau statut, mettre à jour immédiatement l'UI
      if (newStatus) {
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? { ...job, is_verified: newStatus } : job
          )
        );
        
        // Mettre à jour les statistiques globales
        fetchGlobalStats();
        return;
      }
      
      // Sinon, récupérer les données depuis le backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres_by_id/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const updatedJob = await response.json();
        
        // Mettre à jour uniquement l'offre modifiée dans le state
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.id === jobId ? { ...job, ...updatedJob } : job
          )
        );
        
        // Mettre à jour les statistiques globales
        fetchGlobalStats();
      } else {
        // Si l'endpoint spécifique échoue, recharger toutes les données
        console.warn('Failed to fetch single job, refreshing all data');
        fetchData(false);
      }
    } catch (error) {
      console.error('Error updating single job:', error);
      // En cas d'erreur, recharger toutes les données
      fetchData(false);
    }
  };

  // Update button text every second when rate limited
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update the countdown
      if (Date.now() - lastFetchTime < MIN_FETCH_INTERVAL) {
        forceUpdate({});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFetchTime]);

  // Statistiques des offres - use global stats instead of filtered data
  const pendingJobs = { length: globalStats.pending };
  const acceptedJobs = { length: globalStats.accepted };
  const declinedJobs = { length: globalStats.declined };

  // Données filtrées selon l'onglet actif - now just returns jobs since filtering is server-side
  const getFilteredData = () => {
    return jobs;
  };

  // Calcul du taux d'acceptation - based on global stats
  const acceptanceRate = globalStats.total > 0 
    ? Math.round((globalStats.accepted / globalStats.total) * 100)
    : 0;

  // Offres récentes (dernières 7 jours)
  const recentJobs = jobs.filter(job => {
    const createdDate = new Date(job.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  });

  // Statistiques par secteur
  const sectorStats = jobs.reduce((acc, job) => {
    const sector = job.sector_name || 'Non défini';
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topSectors = Object.entries(sectorStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  // Handle tab change - update status filter
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page
    
    // Map tab to status filter
    const statusMap: Record<string, string> = {
      'all': 'all',
      'pending': 'Pending',
      'accepted': 'Accepted',
      'declined': 'Declined',
    };
    
    setStatusFilter(statusMap[value] || 'all');
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
        <BreadCrumb items={breadcrumbItems} />
        
        {/* Skeleton pour l'en-tête */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        {/* Skeleton pour les statistiques */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Skeleton pour les onglets */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <div className="flex space-x-2 mt-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
        <BreadCrumb items={breadcrumbItems} />
        <Card className="border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-red-900">Erreur de chargement</h3>
              <p className="text-red-600 max-w-md">{error}</p>
              <Button 
                onClick={() => fetchData()} 
                variant="outline" 
                className="mt-4"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>
              {jobs.length} offre{jobs.length > 1 ? 's' : ''} • 
              Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle vue cartes/tableau */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => fetchData(true)}
            variant="outline"
            size="sm"
            disabled={refreshing || (Date.now() - lastFetchTime < MIN_FETCH_INTERVAL)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {Date.now() - lastFetchTime < MIN_FETCH_INTERVAL && !refreshing 
              ? `Actualiser (${Math.ceil((MIN_FETCH_INTERVAL - (Date.now() - lastFetchTime)) / 1000)}s)`
              : refreshing 
                ? "Actualisation..."
                : "Actualiser"
            }
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{globalStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Offres à valider
            </p>
            {globalStats.pending > 0 && (
              <div className="absolute top-2 right-2">
                <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{globalStats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              Offres publiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{globalStats.declined}</div>
            <p className="text-xs text-muted-foreground">
              Offres rejetées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Sur {globalStats.total} offres
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nouvelles offres (7j)</span>
                <Badge variant="outline" className="font-semibold">
                  {recentJobs.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Offres traitées aujourd'hui</span>
                <Badge variant="outline" className="font-semibold">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Temps de validation moyen</span>
                <Badge variant="outline" className="font-semibold">1.5j</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taux de traitement</span>
                  <span className="font-semibold text-blue-600">
                    {jobs.length > 0 
                      ? Math.round(((acceptedJobs.length + declinedJobs.length) / jobs.length) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Secteurs populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Secteurs avec le plus d'offres
              </div>
              <div className="space-y-2">
                {topSectors.map(([sector, count]) => (
                  <div key={sector} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{sector}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((count / jobs.length) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tendances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Évolution des offres
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cette semaine</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="font-semibold">
                      {recentJobs.length}
                    </Badge>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pic d'activité</span>
                  <Badge variant="outline" className="text-xs">
                    Mardi
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Délai moyen</span>
                  <Badge variant="outline" className="text-xs">
                    1-2 jours
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerte pour actions requises */}
      {globalStats.pending > 0 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">
                  {globalStats.pending} offre{globalStats.pending > 1 ? 's' : ''} en attente de validation
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Des entreprises attendent la validation de leurs offres d'emploi pour les publier.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                  Action requise
                </Badge>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTab("pending")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Voir les offres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table avec onglets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Gestion des offres d'emploi</CardTitle>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrer par statut</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Toutes ({globalStats.total})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  En attente ({globalStats.pending})
                </TabsTrigger>
                <TabsTrigger value="accepted" className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  Acceptées ({globalStats.accepted})
                </TabsTrigger>
                <TabsTrigger value="declined" className="flex items-center gap-2">
                  <XCircle className="h-3 w-3" />
                  Refusées ({globalStats.declined})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="mt-0">
              <JobRequests 
                data={getFilteredData()} 
                onUpdate={(jobId, newStatus) => {
                  if (jobId) {
                    updateSingleJob(jobId, newStatus);
                  } else {
                    fetchData(false);
                  }
                }}
                viewMode={viewMode}
                // Pass filter and pagination props
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                statusFilter={statusFilter}
                onStatusChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
                sectorFilter={sectorFilter}
                onSectorChange={(value) => {
                  setSectorFilter(value);
                  setCurrentPage(1);
                }}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setCurrentPage(1);
                }}
                totalItems={totalItems}
                totalPages={totalPages}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
