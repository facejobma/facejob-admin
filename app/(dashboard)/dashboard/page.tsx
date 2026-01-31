"use client";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { RecentSales } from "@/components/recent-sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Statistiques } from "@/types";
import { SimpleBarChart } from "@/components/simple-bar-chart";

import * as React from "react";
import { DateRange } from "react-day-picker";
import { addYears } from "date-fns";
import Cookies from "js-cookie";
import { Building2, Users, Briefcase, FileText, TrendingUp } from "lucide-react";

function OverViewTab() {
  const [stats, setStats] = useState<Statistiques>({
    sectors_count: 0,
    postules_count: 0,
    offres_count: 0,
    candidates_count: 0,
    entreprises_count: 0,
    sales: [],
    candidates: [],
    entreprises: [],
    last_n_sales: []
  });
  const [loading, setLoading] = useState(true);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addYears(new Date(), -1),
    to: new Date(),
  });
  const { toast } = useToast();

  const authToken = Cookies.get("authToken");

  useEffect(() => {
    async function getStats() {
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
        setLoading(true);
        
        // Vérifier que l'URL de l'API est définie
        if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
          throw new Error("URL de l'API non configurée");
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/statics?from=${date?.from?.toISOString()}&to=${date?.to?.toISOString()}`;
        console.log("Fetching stats from:", apiUrl);

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
        console.log("Stats API Response:", result);
        
        // Vérifier la structure de la réponse et fournir des valeurs par défaut
        const statsData = {
          sectors_count: result.sectors_count || 0,
          postules_count: result.postules_count || 0,
          offres_count: result.offres_count || 0,
          candidates_count: result.candidates_count || 0,
          entreprises_count: result.entreprises_count || 0,
          sales: Array.isArray(result.sales) ? result.sales : [],
          candidates: Array.isArray(result.candidates) ? result.candidates : [],
          entreprises: Array.isArray(result.entreprises) ? result.entreprises : [],
          last_n_sales: Array.isArray(result.last_n_sales) ? result.last_n_sales : []
        };
        
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        
        let errorMessage = "Erreur lors du chargement des statistiques.";
        
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
        
        // En cas d'erreur, on garde des valeurs par défaut pour éviter les crashes
        setStats({
          sectors_count: 0,
          postules_count: 0,
          offres_count: 0,
          candidates_count: 0,
          entreprises_count: 0,
          sales: [],
          candidates: [],
          entreprises: [],
          last_n_sales: []
        });
      } finally {
        setLoading(false);
      }
    }

    getStats();
  }, [date?.from, date?.to, toast, authToken]);

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
      <div className="flex-1 space-y-6 p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Tableau de bord
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue dans votre interface d'administration FaceJob
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarDateRangePicker date={date} setDate={setDate} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Aperçu général</TabsTrigger>
            <TabsTrigger value="analytics">Analyses détaillées</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {statsCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Card key={index} className="hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {card.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg ${card.bgColor}`}>
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
                        <div className="text-gray-500 dark:text-gray-400">Chargement des données...</div>
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
                        <div className="text-sm">Les données apparaîtront ici une fois disponibles</div>
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
                        <div className="text-sm">Les ventes récentes apparaîtront ici</div>
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
                    Évolution des inscriptions d'entreprises
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
                        <div>Aucune donnée d'entreprise disponible</div>
                        <div className="text-sm">Les statistiques apparaîtront ici</div>
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
                        <div className="text-sm">Les statistiques apparaîtront ici</div>
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
