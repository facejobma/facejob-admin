"use client";
import { FC, useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Users,
  Eye
} from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import { CellAction } from "./cell-action";
import { JobFilters } from "./job-filters";
import { JobPagination } from "./job-pagination";

interface JobCardViewProps {
  data: Job[];
  onUpdate?: (jobId?: number, newStatus?: string) => void; // Callback avec ID et statut optionnels
  // Filter props
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  sectorFilter?: string;
  onSectorChange?: (value: string) => void;
  // Pagination props
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  totalPages?: number;
}

export const JobCardView: FC<JobCardViewProps> = ({ 
  data, 
  onUpdate,
  searchValue = "",
  onSearchChange,
  statusFilter = "all",
  onStatusChange,
  sectorFilter = "all",
  onSectorChange,
  currentPage = 1,
  onPageChange,
  pageSize = 12,
  onPageSizeChange,
  totalItems = 0,
  totalPages = 0,
}) => {

  // Extraire les secteurs uniques
  const sectors = useMemo(() => {
    const uniqueSectors = Array.from(
      new Set(data.map(job => job.sector_name).filter(Boolean))
    ).map((name, index) => ({ id: index, name: name as string }));
    return uniqueSectors;
  }, [data]);

  // No client-side filtering - data is already filtered by server
  // Just display the data as-is

  const getStatusBadge = (isVerified: any) => {
    if (isVerified === true || isVerified === "Accepted") {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-sm text-xs py-0 h-5">
          <CheckCircle className="w-3 h-3 mr-1" />
          Publiée
        </Badge>
      );
    } else if (isVerified === false || isVerified === "Declined") {
      return (
        <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 shadow-sm text-xs py-0 h-5">
          <XCircle className="w-3 h-3 mr-1" />
          Refusée
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 shadow-sm animate-pulse text-xs py-0 h-5">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="px-6 pt-4">
        <JobFilters
          searchValue={searchValue}
          onSearchChange={onSearchChange || (() => {})}
          statusFilter={statusFilter}
          onStatusChange={onStatusChange || (() => {})}
          sectorFilter={sectorFilter}
          onSectorChange={onSectorChange || (() => {})}
          sectors={sectors}
          totalResults={totalItems}
        />
      </div>

      {/* Cartes */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune offre trouvée</h3>
          <p className="text-muted-foreground max-w-md">
            {searchValue || statusFilter !== "all" || sectorFilter !== "all"
              ? "Aucune offre ne correspond aux critères de recherche. Essayez de modifier vos filtres."
              : "Il n'y a actuellement aucune offre d'emploi."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
            {data.map((job) => (
        <Card key={job.id} className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-white to-gray-50/30">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-0.5 group-hover:text-blue-600 transition-colors leading-tight" title={job.titre}>
                    {job.titre}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{job.company_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(job.is_verified)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-2 px-4 flex-1">
            <div className="space-y-1.5">
              {/* Secteur */}
              {job.sector_name && (
                <div className="flex items-center gap-1.5 text-xs bg-slate-50 rounded px-2 py-1">
                  <Briefcase className="w-3 h-3 text-slate-600 flex-shrink-0" />
                  <span className="text-slate-700 truncate font-medium">{job.sector_name}</span>
                </div>
              )}

              {/* Localisation et Type de contrat sur la même ligne */}
              <div className="flex items-center gap-2 flex-wrap">
                {job.location && (
                  <div className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                    <span className="text-slate-600 truncate">{job.location}</span>
                  </div>
                )}
                {job.contractType && (
                  <Badge variant="outline" className="text-xs py-0 h-5 bg-white shadow-sm">
                    {job.contractType}
                  </Badge>
                )}
              </div>

              {/* Dates compactes */}
              {(job.date_debut || job.date_fin) && (
                <div className="flex items-center gap-2 text-xs pt-1">
                  {job.date_debut && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 rounded px-1.5 py-0.5">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{moment(job.date_debut).format("DD/MM/YY")}</span>
                    </div>
                  )}
                  {job.date_fin && (
                    <div className="flex items-center gap-1 text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">
                      <Calendar className="w-3 h-3" />
                      <span className="font-medium">{moment(job.date_fin).format("DD/MM/YY")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Statistiques compactes */}
              <div className="flex items-center gap-2 text-xs pt-1">
                <div className="flex items-center gap-1 bg-blue-50 rounded-full px-2 py-0.5">
                  <Users className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-blue-700">{job.applications_count || 0}</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 rounded-full px-2 py-0.5">
                  <Eye className="w-3 h-3 text-purple-600" />
                  <span className="font-semibold text-purple-700">{job.views_count || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-2 px-4 border-t bg-slate-50/50 flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {moment(job.created_at).format("DD/MM/YY")}
            </div>
            <CellAction data={job} onUpdate={onUpdate} />
          </CardFooter>
        </Card>
      ))}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
      <JobPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange || (() => {})}
        onPageSizeChange={onPageSizeChange || (() => {})}
      />
    )}
    </>
  )}
  </div>
  );
};
