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
import { Button } from "./button";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [selectValue, setSelectValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      
      const sector = (row.original as any).sector;
      const sectorName = typeof sector === 'object' && sector !== null 
        ? sector.name 
        : sector;
      
      return sectorName?.toLowerCase().includes(filterValue.toLowerCase()) || false;
    }
  });

  useEffect(() => {
    table.getColumn(searchKey)?.setFilterValue(searchValue);
  }, [searchKey, searchValue, table]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectValue(selectedValue);
    table.setGlobalFilter(selectedValue);
  };

  const filteredRows = table.getFilteredRowModel().rows;
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRows.length);
  const totalPages = Math.ceil(filteredRows.length / pageSize);

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
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
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
        
        <div className="relative min-w-[160px]">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={selectValue || ""}
            onChange={handleSelectChange}
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
                      className={`font-semibold text-xs ${
                        index === 0 ? 'w-1/4' : 
                        index === 1 ? 'w-1/3' : 
                        index === 2 ? 'w-1/6' : 
                        index === 3 ? 'w-1/6' : 
                        'w-1/12'
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
                  .slice(startIndex, endIndex)
                  .map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell 
                          key={cell.id} 
                          className={`text-xs truncate ${
                            index === 0 ? 'w-1/4' : 
                            index === 1 ? 'w-1/3' : 
                            index === 2 ? 'w-1/6' : 
                            index === 3 ? 'w-1/6' : 
                            'w-1/12'
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

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur {filteredRows.length} ligne(s) sélectionnée(s)
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Affichage {startIndex + 1}-{Math.min(endIndex, filteredRows.length)} sur {filteredRows.length}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} sur {Math.max(1, totalPages)}
            </span>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
