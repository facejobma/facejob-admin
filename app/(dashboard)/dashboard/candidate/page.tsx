"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { UserClient } from "@/components/tables/user-tables/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

import Cookies from "js-cookie";

const breadcrumbItems = [{ title: "Candidats", link: "/dashboard/candidate" }];

export default function CandidatesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
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

        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/candidates`;
        console.log("Fetching candidates from:", apiUrl);

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
        console.log("API Response:", result);

        // Vérifier la structure de la réponse
        if (result && Array.isArray(result.data)) {
          setUsers(result.data);
        } else if (Array.isArray(result)) {
          setUsers(result);
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
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, toast]);

  // Calculer les statistiques
  const totalCandidates = users.length;
  const activeCandidates = users.filter((user: any) => user.email_verified_at).length;
  const inactiveCandidates = totalCandidates - activeCandidates;
  const recentCandidates = users.filter((user: any) => {
    const createdAt = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt > thirtyDaysAgo;
  }).length;

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
                      Il n'y a actuellement aucun candidat dans la base de données.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-hidden">
                <UserClient data={users} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
