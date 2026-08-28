"use client";

import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import { Job } from "@/types";
import { Briefcase } from "lucide-react";

interface JobRequestsProps {
  data: Job[];
  onUpdate?: (jobId?: number, newStatus?: string) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  totalPages?: number;
}

export const JobRequests = ({
  data,
  onUpdate,
  currentPage = 1,
  onPageChange,
  pageSize = 12,
  onPageSizeChange,
  totalItems = 0,
  totalPages = 0,
}: JobRequestsProps) => {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-4"><Briefcase className="h-7 w-7 text-muted-foreground" /></div>
        <h3 className="font-semibold">Aucune offre dans cette vue</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">Modifiez les filtres ou sélectionnez un autre statut.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="h-4 w-4" />{totalItems || data.length} résultat{(totalItems || data.length) > 1 ? "s" : ""}</div>
      <DataTable
        searchKey="titre"
        searchPlaceholder="Rechercher une offre sur cette page…"
        columns={createColumns(onUpdate)}
        data={data}
        appearance="clean"
        disablePagination
      />
      <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages || 1} · {totalItems} offre{totalItems > 1 ? "s" : ""}
        </div>
        <div className="flex items-center gap-2">
          <select value={pageSize} onChange={(event) => onPageSizeChange?.(Number(event.target.value))} className="h-9 rounded-md border bg-background px-2 text-sm" aria-label="Nombre d’offres par page">
            {[12, 20, 50].map((size) => <option key={size} value={size}>{size} par page</option>)}
          </select>
          <button className="h-9 rounded-md border px-3 text-sm disabled:opacity-50" onClick={() => onPageChange?.(currentPage - 1)} disabled={currentPage <= 1}>Précédent</button>
          <button className="h-9 rounded-md border px-3 text-sm disabled:opacity-50" onClick={() => onPageChange?.(currentPage + 1)} disabled={currentPage >= totalPages}>Suivant</button>
        </div>
      </div>
    </div>
  );
};
