import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "./input";
import { Search, Filter } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
}

export function CandidateDataTable<TData, TValue>({
  columns,
  data,
  searchKey
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="relative min-w-[160px] max-w-[200px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={sectorFilter || ""}
            onChange={handleSectorChange}
            className="w-full pl-10 pr-8 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
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
          >
            <option value="">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full border rounded-lg overflow-hidden">
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
