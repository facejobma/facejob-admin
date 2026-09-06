"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { EntrepriseProfile } from "@/components/forms/entreprise-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SafeLogo } from "@/components/ui/safe-logo";
import { AlertCircle, ArrowLeft, Building2, Calendar } from "lucide-react";
import Cookies from "js-cookie";

export default function Page() {
  const [enterpriseData, setEnterpriseData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { requestId } = useParams();
  const router = useRouter();

  const breadcrumbItems = [
    { title: "Requests", link: "/dashboard/requests" },
    { title: "Détails", link: `/dashboard/requests/${requestId}` },
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
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(
              `Erreur ${response.status}: ${response.statusText}`,
            );
          }

          const data = await response.json();
          setEnterpriseData(data);
        } catch (error) {
          console.error("Erreur lors du chargement:", error);
          setError(
            error instanceof Error ? error.message : "Une erreur est survenue",
          );
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
        <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
          <BreadCrumb items={breadcrumbItems} />
          <div className="grid gap-6">
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800">
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
        <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
          <BreadCrumb items={breadcrumbItems} />
          <Card className="rounded-2xl border-red-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="space-y-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">
                    Erreur de chargement
                  </h3>
                  <p className="text-red-600">{error}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/requests")}
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux demandes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/requests")}
              className="rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Demande #{requestId}
              </span>
            </div>
          </div>
        </div>

        {enterpriseData && (
          <div className="grid gap-6">
            {/* Header avec statut */}
            <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 text-white shadow-xl shadow-emerald-950/10">
              <CardHeader>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white">
                      <SafeLogo
                        src={enterpriseData.logo}
                        alt={`Logo de ${enterpriseData.company_name}`}
                        className="h-full w-full object-contain p-2"
                        fallbackClassName="h-7 w-7 text-slate-400"
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-2xl font-bold">
                        {enterpriseData.company_name}
                      </CardTitle>
                      <p className="mt-1 text-emerald-50">
                        Demande de validation d'entreprise
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        enterpriseData.is_verified === "Accepted"
                          ? "default"
                          : enterpriseData.is_verified === "Pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-sm"
                    >
                      {enterpriseData.is_verified === "Accepted"
                        ? "Acceptée"
                        : enterpriseData.is_verified === "Pending"
                          ? "En attente"
                          : "Refusée"}
                    </Badge>
                    {enterpriseData.created_at && (
                      <div className="flex items-center gap-1 text-sm text-emerald-50">
                        <Calendar className="h-4 w-4" />
                        {new Date(enterpriseData.created_at).toLocaleDateString(
                          "fr-FR",
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Contenu principal */}
            <EntrepriseProfile
              initialData={enterpriseData}
              onStatusChange={(status) =>
                setEnterpriseData((current: any) =>
                  current ? { ...current, is_verified: status } : current,
                )
              }
              key={requestId as string}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
