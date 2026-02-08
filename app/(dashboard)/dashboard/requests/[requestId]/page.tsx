"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { EntrepriseProfile } from "@/components/forms/entreprise-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Building2, Calendar, Clock } from "lucide-react";
import Cookies from "js-cookie";

export default function Page() {
  const [enterpriseData, setEnterpriseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { requestId } = useParams();

  const breadcrumbItems = [
    { title: "Requests", link: "/dashboard/requests" },
    { title: "Détails", link: `/dashboard/requests/${requestId}` }
  ];

  useEffect(() => {
    if (requestId) {
      const fetchEnterpriseData = async () => {
        try {
          setLoading(true);
          setError(null);
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enterprise/${requestId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json"
              }
            }
          );

          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          setEnterpriseData(data);
        } catch (error) {
          console.error("Erreur lors du chargement:", error);
          setError(error instanceof Error ? error.message : "Une erreur est survenue");
        } finally {
          setLoading(false);
        }
      };

      fetchEnterpriseData();
    }
  }, [requestId]);

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6">
          <BreadCrumb items={breadcrumbItems} />
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6">
          <BreadCrumb items={breadcrumbItems} />
          <Card className="border-red-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Erreur de chargement</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">ID: {requestId}</span>
          </div>
        </div>

        {enterpriseData && (
          <div className="grid gap-6">
            {/* Header avec statut */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {enterpriseData.company_name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">
                      Demande de validation d'entreprise
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        enterpriseData.is_verified === "Accepted" ? "default" :
                        enterpriseData.is_verified === "Pending" ? "secondary" : 
                        "destructive"
                      }
                      className="text-sm"
                    >
                      {enterpriseData.is_verified === "Accepted" ? "Acceptée" :
                       enterpriseData.is_verified === "Pending" ? "En attente" : 
                       "Refusée"}
                    </Badge>
                    {enterpriseData.created_at && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(enterpriseData.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Contenu principal */}
            <EntrepriseProfile
              initialData={enterpriseData}
              key={requestId as string}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
