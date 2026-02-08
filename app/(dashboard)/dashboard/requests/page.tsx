"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { EnterpriseRequests } from "@/components/tables/request-tables/requests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  RefreshCw,
  Filter,
  Download,
  Calendar,
  Users,
  BarChart3,
  Activity
} from "lucide-react";
import { EnterpriseData } from "@/types";

const breadcrumbItems = [{ title: "Demandes d'entreprises", link: "/dashboard/requests" }];

export default function RequestsPage() {
  const [entrepriseRequests, setEntrepriseRequests] = useState<EnterpriseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [, forceUpdate] = useState({});
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  // Minimum time between requests (5 seconds)
  const MIN_FETCH_INTERVAL = 5000;

  const fetchData = async (showRefreshToast = false) => {
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
      
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin/entreprises",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );

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
      setEntrepriseRequests(result.data || []);
      
      if (showRefreshToast) {
        toast({
          title: "Données actualisées",
          description: "Les demandes ont été mises à jour avec succès.",
        });
      }
    } catch (error) {
      console.error("Requests fetch error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la récupération des données.";
      setError(errorMessage);
      
      // Don't show toast for rate limit errors as we handle them above
      if (!errorMessage.includes('429')) {
        toast({
          title: "Erreur",
          variant: "destructive",
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authToken]);

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

  // Statistiques des demandes
  const pendingRequests = entrepriseRequests.filter(
    (entreprise) => 
      entreprise?.is_verified === false || 
      entreprise?.is_verified === "Pending" ||
      (!entreprise?.is_verified && entreprise?.is_verified !== true)
  );

  const acceptedRequests = entrepriseRequests.filter(
    (entreprise) => entreprise?.is_verified === true || entreprise?.is_verified === "Accepted"
  );

  const declinedRequests = entrepriseRequests.filter(
    (entreprise) => entreprise?.is_verified === "Declined"
  );

  // Données filtrées selon l'onglet actif
  const getFilteredData = () => {
    switch (activeTab) {
      case "pending":
        return pendingRequests;
      case "accepted":
        return acceptedRequests;
      case "declined":
        return declinedRequests;
      default:
        return entrepriseRequests;
    }
  };

  // Calcul du taux d'acceptation
  const acceptanceRate = entrepriseRequests.length > 0 
    ? Math.round((acceptedRequests.length / entrepriseRequests.length) * 100)
    : 0;

  // Demandes récentes (dernières 7 jours)
  const recentRequests = entrepriseRequests.filter(entreprise => {
    const createdDate = new Date(entreprise.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  });

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
            <Building2 className="h-4 w-4" />
            <span>
              {entrepriseRequests.length} entreprise{entrepriseRequests.length > 1 ? 's' : ''} • 
              Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Demandes à traiter
            </p>
            {pendingRequests.length > 0 && (
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
            <div className="text-2xl font-bold text-green-600">{acceptedRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Entreprises validées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{declinedRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Demandes rejetées
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
              Sur {entrepriseRequests.length} demandes
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
                <span className="text-sm text-muted-foreground">Nouvelles demandes (7j)</span>
                <Badge variant="outline" className="font-semibold">
                  {recentRequests.length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Demandes traitées aujourd'hui</span>
                <Badge variant="outline" className="font-semibold">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Temps de réponse moyen</span>
                <Badge variant="outline" className="font-semibold">2.3j</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taux de traitement</span>
                  <span className="font-semibold text-blue-600">
                    {entrepriseRequests.length > 0 
                      ? Math.round(((acceptedRequests.length + declinedRequests.length) / entrepriseRequests.length) * 100)
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
              <Users className="h-4 w-4" />
              Répartition par secteur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground mb-3">
                Secteurs les plus représentés
              </div>
              <div className="space-y-2">
                {/* Calcul dynamique des secteurs */}
                {(() => {
                  const sectorCounts = entrepriseRequests.reduce((acc, entreprise) => {
                    const sectorName = typeof entreprise.sector === 'object' 
                      ? entreprise.sector?.name 
                      : entreprise.sector || 'Non défini';
                    acc[sectorName] = (acc[sectorName] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  const topSectors = Object.entries(sectorCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3);
                  
                  return topSectors.map(([sector, count]) => (
                    <div key={sector} className="flex items-center justify-between">
                      <span className="text-sm truncate flex-1 mr-2">{sector}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((count / entrepriseRequests.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  ));
                })()}
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
                Évolution des demandes
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cette semaine</span>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="font-semibold">
                      {recentRequests.length}
                    </Badge>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pic d'activité</span>
                  <Badge variant="outline" className="text-xs">
                    Lundi
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Délai moyen</span>
                  <Badge variant="outline" className="text-xs">
                    2-3 jours
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerte pour actions requises */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en attente de validation
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Des entreprises attendent votre validation pour accéder à la plateforme. 
                  Cliquez sur une demande pour la traiter.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  Action requise
                </Badge>
                <Button 
                  size="sm" 
                  onClick={() => setActiveTab("pending")}
                  className="bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600"
                >
                  Voir les demandes
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
            <CardTitle className="text-xl">Gestion des demandes</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrer par statut</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-2">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Toutes ({entrepriseRequests.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  En attente ({pendingRequests.length})
                </TabsTrigger>
                <TabsTrigger value="accepted" className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  Acceptées ({acceptedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="declined" className="flex items-center gap-2">
                  <XCircle className="h-3 w-3" />
                  Refusées ({declinedRequests.length})
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="mt-0">
              <EnterpriseRequests data={getFilteredData()} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
