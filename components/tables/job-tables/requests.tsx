"use client";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { FC } from "react";
import { JobDataTable } from "@/components/ui/job-table";
import { columns } from "@/components/tables/job-tables/columns";
import { Job } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface JobProps {
  data: Job[];
}

export const JobRequests: FC<JobProps> = ({ data }) => {
  // Statistiques rapides pour cette vue
  const pendingCount = data.filter(
    (job) => 
      job?.is_verified === false || 
      job?.is_verified === "Pending" ||
      (!job?.is_verified && job?.is_verified !== true)
  ).length;

  const acceptedCount = data.filter(
    (job) => job?.is_verified === true || job?.is_verified === "Accepted"
  ).length;

  const declinedCount = data.filter(
    (job) => job?.is_verified === "Declined"
  ).length;

  // Message d'état selon les données affichées
  const getStatusMessage = () => {
    if (data.length === 0) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        text: "Aucune offre trouvée",
        description: "Il n'y a actuellement aucune offre d'emploi correspondant aux critères sélectionnés."
      };
    }

    if (pendingCount === data.length) {
      return {
        icon: <Clock className="h-4 w-4" />,
        text: `${pendingCount} offre${pendingCount > 1 ? 's' : ''} en attente`,
        description: "Ces offres nécessitent votre validation pour être publiées."
      };
    }

    if (acceptedCount === data.length) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: `${acceptedCount} offre${acceptedCount > 1 ? 's' : ''} publiée${acceptedCount > 1 ? 's' : ''}`,
        description: "Ces offres ont été validées et sont visibles par les candidats."
      };
    }

    if (declinedCount === data.length) {
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: `${declinedCount} offre${declinedCount > 1 ? 's' : ''} refusée${declinedCount > 1 ? 's' : ''}`,
        description: "Ces offres ont été rejetées."
      };
    }

    return {
      icon: <Briefcase className="h-4 w-4" />,
      text: `${data.length} offre${data.length > 1 ? 's' : ''} d'emploi`,
      description: "Vue d'ensemble de toutes les offres d'emploi."
    };
  };

  const statusInfo = getStatusMessage();
  
  return (
    <div className="space-y-4 p-6">
      {/* En-tête avec informations contextuelles */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            {statusInfo.icon}
            {statusInfo.text}
          </div>
          <p className="text-sm text-muted-foreground">
            {statusInfo.description}
          </p>
          
          {/* Badges de répartition si on affiche toutes les offres */}
          {data.length > 0 && pendingCount !== data.length && acceptedCount !== data.length && declinedCount !== data.length && (
            <div className="flex flex-wrap gap-2 mt-3">
              {pendingCount > 0 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <Clock className="h-3 w-3 mr-1" />
                  {pendingCount} en attente
                </Badge>
              )}
              {acceptedCount > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {acceptedCount} acceptées
                </Badge>
              )}
              {declinedCount > 0 && (
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  {declinedCount} refusées
                </Badge>
              )}
            </div>
          )}
        </div>

        {data.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>
              {data.length} résultat{data.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {data.length > 0 && <Separator />}
      
      {/* Table des données */}
      {data.length > 0 ? (
        <div className="rounded-lg border bg-white">
          <JobDataTable searchKey="titre" columns={columns} data={data} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune offre trouvée</h3>
          <p className="text-muted-foreground max-w-md">
            Il n'y a actuellement aucune offre d'emploi correspondant aux critères sélectionnés. 
            Les nouvelles offres apparaîtront ici automatiquement.
          </p>
        </div>
      )}
    </div>
  );
};
