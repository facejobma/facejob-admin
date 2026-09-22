"use client";

import { FC, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  Clock,
  CreditCard,
  RefreshCw,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Sales } from "@/types";
import BreadCrumb from "@/components/breadcrumb";
import { columns } from "@/components/tables/sales-tables/columns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SalesDataTable } from "@/components/ui/sales-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SalesTableProps {
  data: Sales[];
  isLoading?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

type SalesTab = "all" | "pending" | "accepted" | "rejected";

const breadcrumbItems = [{ title: "Les ventes", link: "/dashboard/sales" }];

const normalizeStatus = (status: Sales["status"]) =>
  status === "Declined" ? "Rejected" : status;

export const SalesTable: FC<SalesTableProps> = ({
  data,
  isLoading = false,
  lastUpdated,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<SalesTab>("all");

  const stats = useMemo(() => {
    const pending = data.filter(
      (payment) => normalizeStatus(payment.status) === "Pending",
    ).length;
    const accepted = data.filter(
      (payment) => normalizeStatus(payment.status) === "Accepted",
    ).length;
    const rejected = data.filter(
      (payment) => normalizeStatus(payment.status) === "Rejected",
    ).length;
    const acceptedRevenue = data
      .filter((payment) => normalizeStatus(payment.status) === "Accepted")
      .reduce((total, payment) => total + Number(payment.price || 0), 0);

    return {
      pending,
      accepted,
      rejected,
      acceptedRevenue,
      acceptanceRate:
        data.length > 0 ? Math.round((accepted / data.length) * 100) : 0,
    };
  }, [data]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return data;

    const expectedStatus = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
    }[activeTab];

    return data.filter(
      (payment) => normalizeStatus(payment.status) === expectedStatus,
    );
  }, [activeTab, data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <BreadCrumb items={breadcrumbItems} />
          <h1 className="pt-2 text-2xl font-semibold tracking-tight">
            Gestion des demandes d’abonnement
          </h1>
          <p className="text-sm text-muted-foreground">
            Examinez les entreprises, les plans demandés et traitez les demandes
            d’abonnement.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>
              {data.length} demande{data.length > 1 ? "s" : ""} enregistrée
              {data.length > 1 ? "s" : ""}
              {lastUpdated
                ? ` • Dernière mise à jour : ${lastUpdated.toLocaleTimeString(
                    "fr-FR",
                    { hour: "2-digit", minute: "2-digit" },
                  )}`
                : ""}
            </span>
          </div>
        </div>

        {onRefresh && (
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Actualisation..." : "Actualiser"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Demandes à valider</p>
            {stats.pending > 0 && (
              <div className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </div>
            <p className="text-xs text-muted-foreground">Abonnements activés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <p className="text-xs text-muted-foreground">Demandes rejetées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Montant accepté
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.acceptedRevenue.toFixed(2)} DH
            </div>
            <p className="text-xs text-muted-foreground">Demandes acceptées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux d’acceptation
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {stats.acceptanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Sur {data.length} demandes
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Clock className="h-6 w-6 flex-shrink-0 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">
                  {stats.pending} demande{stats.pending > 1 ? "s" : ""} en
                  attente de validation
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Des entreprises attendent l’activation de leur abonnement.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-yellow-200 text-yellow-800"
                >
                  Action requise
                </Badge>
                <Button
                  size="sm"
                  onClick={() => setActiveTab("pending")}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Voir les demandes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-lg">Demandes d’abonnement</CardTitle>
          <p className="text-sm text-muted-foreground">
            Filtrez les demandes par statut puis ouvrez une fiche pour consulter
            tous les détails.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as SalesTab)}
            className="w-full"
          >
            <div className="overflow-x-auto px-6 pt-4">
              <TabsList className="inline-flex h-auto min-w-full justify-start gap-1 p-1 sm:min-w-0">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Toutes ({data.length})
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-3 w-3" />
                  En attente ({stats.pending})
                </TabsTrigger>
                <TabsTrigger
                  value="accepted"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-3 w-3" />
                  Acceptées ({stats.accepted})
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-3 w-3" />
                  Refusées ({stats.rejected})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0 p-6 pt-4">
              <SalesDataTable
                columns={columns}
                data={filteredData}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
