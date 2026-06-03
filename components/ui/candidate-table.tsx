import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "./input";
import { CheckCircle, Filter, Loader2, Search, Trash2, XCircle } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function CandidateDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRefresh,
  isRefreshing
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { toast } = useToast();

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onRefresh,
    },
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      
      const { sector: sectorValue, status: statusValue, search: searchValue } = filterValue;
      
      // Filtre par recherche textuelle
      if (searchValue) {
        const candidate = row.original as any;
        const fullName = candidate.first_name && candidate.last_name 
          ? `${candidate.first_name} ${candidate.last_name}`
          : candidate.nomComplete || '';
        const email = candidate.email || '';
        const searchText = `${fullName} ${email}`.toLowerCase();
        
        if (!searchText.includes(searchValue.toLowerCase())) {
          return false;
        }
      }
      
      // Filtre par secteur
      if (sectorValue) {
        const sector = (row.original as any).sector;
        const sectorName = typeof sector === 'object' && sector !== null 
          ? sector.name 
          : sector;
        
        if (!sectorName?.toLowerCase().includes(sectorValue.toLowerCase())) {
          return false;
        }
      }
      
      // Filtre par statut
      if (statusValue) {
        const isVerified = (row.original as any).email_verified_at;
        const candidateStatus = isVerified ? 'actif' : 'inactif';
        
        if (candidateStatus !== statusValue) {
          return false;
        }
      }
      
      return true;
    }
  });

  useEffect(() => {
    // Appliquer les filtres combinés
    table.setGlobalFilter({
      sector: sectorFilter,
      status: statusFilter,
      search: searchValue
    });
  }, [sectorFilter, statusFilter, searchValue, table]);

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSectorFilter(event.target.value);
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  const filteredRows = table.getFilteredRowModel().rows;
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCandidates = selectedRows.map((row) => row.original as any);
  const selectedCount = selectedCandidates.length;

  const runBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedCount === 0) return;

    const authToken = Cookies.get("authToken");

    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description: "Token d'authentification manquant. Veuillez vous reconnecter.",
      });
      return;
    }

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "URL de l'API non configurée.",
      });
      return;
    }

    try {
      setBulkLoading(true);

      const requests = selectedCandidates.map((candidate) => {
        const endpoint =
          action === "delete"
            ? `/api/v1/admin/candidate/delete/${candidate.id}`
            : `/api/v1/admin/candidate/${candidate.id}/${action}`;

        return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
          method: action === "delete" ? "DELETE" : "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
      });

      const results = await Promise.allSettled(requests);
      const successCount = results.filter(
        (result) => result.status === "fulfilled" && result.value.ok,
      ).length;
      const failedCount = selectedCount - successCount;

      if (successCount > 0) {
        const actionLabel =
          action === "activate"
            ? "activé"
            : action === "deactivate"
              ? "désactivé"
              : "supprimé";

        toast({
          title: failedCount > 0 ? "Action partiellement terminée" : "Succès",
          description: `${successCount} candidat(s) ${actionLabel}(s).${
            failedCount > 0 ? ` ${failedCount} échec(s).` : ""
          }`,
          variant: failedCount > 0 ? "destructive" : "default",
        });

        table.resetRowSelection();
        onRefresh?.();
      } else {
        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Aucune action n'a pu être effectuée.",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Une erreur est survenue pendant l'action groupée.",
      });
    } finally {
      setBulkLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const sectors = Array.from(new Set(
    data
      .map(item => {
        const sector = (item as any).sector;
        if (typeof sector === 'object' && sector !== null) {
          return sector.name;
        }
        return sector;
      })
      .filter(Boolean)
  ));

  return (
    <div className="w-full space-y-4 overflow-x-hidden">
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => runBulkAction("delete")}
        loading={bulkLoading}
      />

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="pl-10"
            disabled={isRefreshing}
          />
        </div>
        
        <div className="relative min-w-[160px] max-w-[200px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={sectorFilter || ""}
            onChange={handleSectorChange}
            className="w-full pl-10 pr-8 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isRefreshing}
          >
            <option value="">Tous les secteurs</option>
            {sectors.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[140px] max-w-[180px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={statusFilter || ""}
            onChange={handleStatusChange}
            className="w-full pl-10 pr-8 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isRefreshing}
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {selectedCount} candidat(s) sélectionné(s)
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runBulkAction("activate")}
              disabled={bulkLoading || isRefreshing}
            >
              {bulkLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              )}
              Activer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => runBulkAction("deactivate")}
              disabled={bulkLoading || isRefreshing}
            >
              {bulkLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4 text-red-600" />
              )}
              Désactiver
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              disabled={bulkLoading || isRefreshing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="w-full border rounded-lg overflow-hidden relative min-h-[400px]">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-sm font-medium">Actualisation...</span>
            </div>
          </div>
        )}
        <div className="w-full">
          <Table className="w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, index) => (
                    <TableHead 
                      key={header.id} 
                      className={`font-semibold text-xs whitespace-nowrap ${
                        index === 0 ? 'w-12 text-center' : 
                        index === 1 ? 'w-1/4' : 
                        index === 2 ? 'w-1/8' : 
                        index === 3 ? 'w-1/8' : 
                        index === 4 ? 'w-1/12' :
                        index === 5 ? 'w-1/4' :
                        index === 6 ? 'w-1/8' :
                        'w-16 text-center'
                      }`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Aucun candidat trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                  filteredRows
                    .map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                        {row.getVisibleCells().map((cell, index) => (
                          <TableCell 
                            key={cell.id} 
                            className={`text-xs ${
                              index === 0 ? 'w-12 text-center' : 
                              index === 1 ? 'w-1/4 truncate' : 
                              index === 2 ? 'w-1/8 truncate' : 
                              index === 3 ? 'w-1/8 truncate' : 
                              index === 4 ? 'w-1/12 truncate' :
                              index === 5 ? 'w-1/4 truncate' :
                              index === 6 ? 'w-1/8 truncate' :
                              'w-16 text-center'
                            }`}
                            title={typeof cell.getValue() === 'string' ? cell.getValue() as string : ''}
                          >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Removed as requested */}
    </div>
  );
}
