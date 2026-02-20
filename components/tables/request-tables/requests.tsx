"use client";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/request-tables/columns";
import { FC } from "react";
import { EnterpriseData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Building2, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface EntrepriseProps {
  data: EnterpriseData[];
}

export const EnterpriseRequests: FC<EntrepriseProps> = ({ data }) => {
  // Statistiques rapides pour cette vue
  const pendingCount = data.filter(
    (entreprise) => 
      entreprise?.is_verified === false || 
      entreprise?.is_verified === "Pending" ||
      (!entreprise?.is_verified && entreprise?.is_verified !== true)
  ).length;

  const acceptedCount = data.filter(
    (entreprise) => entreprise?.is_verified === true || entreprise?.is_verified === "Accepted"
  ).length;

  const declinedCount = data.filter(
    (entreprise) => entreprise?.is_verified === "Declined"
  ).length;

  // Message d'état selon les données affichées
  const getStatusMessage = () => {
    if (data.length === 0) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        text: "Aucune demande trouvée",
        description: "Il n'y a actuellement aucune demande correspondant aux critères sélectionnés."
      };
    }

    if (pendingCount === data.length) {
      return {
        icon: <Clock className="h-4 w-4" />,
        text: `${pendingCount} demande${pendingCount > 1 ? 's' : ''} en attente`,
        description: "Ces demandes nécessitent votre attention pour validation."
      };
    }

    if (acceptedCount === data.length) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: `${acceptedCount} entreprise${acceptedCount > 1 ? 's' : ''} validée${acceptedCount > 1 ? 's' : ''}`,
        description: "Ces entreprises ont été acceptées et peuvent utiliser la plateforme."
      };
    }

    if (declinedCount === data.length) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: `${declinedCount} demande${declinedCount > 1 ? 's' : ''} refusée${declinedCount > 1 ? 's' : ''}`,
        description: "Ces demandes ont été rejetées."
      };
    }

    return {
      icon: <Building2 className="h-4 w-4" />,
      text: `${data.length} entreprise${data.length > 1 ? 's' : ''}`,
      description: "Vue d'ensemble de toutes les demandes d'entreprises."
    };
  };

  const statusInfo = getStatusMessage();
  
  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/50 dark:to-blue-950/30 rounded-lg">
      {/* En-tête avec informations contextuelles */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {statusInfo.icon}
            {statusInfo.text}
          </div>
          <p className="text-sm text-muted-foreground">
            {statusInfo.description}
          </p>
          
          {/* Badges de répartition si on affiche toutes les demandes */}
          {data.length > 0 && pendingCount !== data.length && acceptedCount !== data.length && declinedCount !== data.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingCount} en attente
                </Badge>
              )}
              {acceptedCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {acceptedCount} acceptées
                </Badge>
              )}
              {declinedCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
                  <XCircle className="h-3 w-3 mr-1" />
                  {declinedCount} refusées
                </Badge>
              )}
            </div>
          )}
        </div>

        {data.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>
              {data.length} résultat{data.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {data.length > 0 && <Separator />}
      
      {/* Table des données */}
      {data.length > 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <DataTable 
            searchKey="company_name" 
            columns={columns} 
            data={data}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-4 mb-4 shadow-sm">
            <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Aucune demande trouvée</h3>
          <p className="text-muted-foreground max-w-md text-sm">
            Il n'y a actuellement aucune demande d'entreprise correspondant aux critères sélectionnés. 
            Les nouvelles demandes apparaîtront ici automatiquement.
          </p>
        </div>
      )}
    </div>
  );
};
