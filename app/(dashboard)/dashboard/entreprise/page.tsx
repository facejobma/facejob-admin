"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { UserEnterprise } from "@/components/tables/user-tables/entreprises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Clock, XCircle } from "lucide-react";

import { EnterpriseData } from "@/types";

const breadcrumbItems = [
  { title: "Entreprise", link: "/dashboard/entreprise" },
];

export default function EntreprisePage() {
  const [entrepriseRequests, setEntrepriseRequests] = useState(
    [] as EnterpriseData[],
  );
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin/entreprises",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const result = await response.json();

        console.log("API Response:", result);
        console.log("Entreprises data:", result.data);
        
        // Extract the data array from the API response
        setEntrepriseRequests(result.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      }
    };

    fetchData();
  }, [authToken, toast]);

  // Calculate statistics
  const totalEntreprises = entrepriseRequests.length;
  const acceptedEntreprises = entrepriseRequests.filter(
    (entreprise) => entreprise?.is_verified === true || entreprise?.is_verified === "Accepted"
  ).length;
  const pendingEntreprises = entrepriseRequests.filter(
    (entreprise) => entreprise?.is_verified !== true && 
                   entreprise?.is_verified !== "Accepted" && 
                   entreprise?.is_verified !== false && 
                   entreprise?.is_verified !== "Declined"
  ).length;
  const rejectedEntreprises = entrepriseRequests.filter(
    (entreprise) => entreprise?.is_verified === false || entreprise?.is_verified === "Declined"
  ).length;

  // Filter data for display (show all enterprises with better filtering)
  const filteredData = entrepriseRequests;
  
  console.log("Total entreprises:", totalEntreprises);
  console.log("Accepted entreprises:", acceptedEntreprises);
  console.log("Sample entreprise:", entrepriseRequests[0]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-full overflow-x-hidden">
      <BreadCrumb items={breadcrumbItems} />
      
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entreprises</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntreprises}</div>
            <p className="text-xs text-muted-foreground">
              Toutes les entreprises inscrites
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedEntreprises}</div>
            <p className="text-xs text-muted-foreground">
              Entreprises vérifiées et actives
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEntreprises}</div>
            <p className="text-xs text-muted-foreground">
              En cours de vérification
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedEntreprises}</div>
            <p className="text-xs text-muted-foreground">
              Entreprises non validées
            </p>
          </CardContent>
        </Card>
      </div>

      <UserEnterprise data={filteredData} />
    </div>
  );
}
