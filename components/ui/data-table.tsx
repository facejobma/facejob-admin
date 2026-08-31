import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "./input";
import { Button } from "./button";
import { ScrollArea, ScrollBar } from "./scroll-area";
import { Sector } from "@/types";
import Cookies from "js-cookie";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  renderBulkActions?: (selectedRows: TData[], resetSelection: () => void) => React.ReactNode;
  disablePagination?: boolean;
  appearance?: "default" | "clean";
  searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onRefresh,
  isLoading,
  isRefreshing,
  renderBulkActions,
  disablePagination = false,
  appearance = "default",
  searchPlaceholder = "Rechercher…",
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>(""); // Default to show all
  const [sectorValue, setSectorValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [sectors, setSectors] = useState<Sector[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
      {
        headers:{
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("authToken")}`,
        }
      })
      .then((response) => response.json())
      .then((result) => {
        // Handle both array and object responses
        const sectorsData = Array.isArray(result) ? result : (result.data || []);
        setSectors(sectorsData);
      })
      .catch(() => {
        setSectors([]); // Set empty array on error
      });
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      onRefresh,
    },
  });

  useEffect(() => {
    table.getColumn(searchKey)?.setFilterValue(searchValue);
  }, [searchKey, searchValue, table]);

  // Status filtering - find the is_verified column and filter it
  useEffect(() => {
    const statusColumn = table.getColumn('is_verified');
    if (statusColumn) {
      if (selectValue) {
        statusColumn.setFilterValue(selectValue);
      } else {
        statusColumn.setFilterValue(undefined);
      }
    }
  }, [selectValue, table]);

  useEffect(() => {
    if (sectorValue) {
      // Apply sector filter logic here if needed
      // This depends on how your data structure handles sectors
    }
  }, [sectorValue, table]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectValue(selectedValue);
  };

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSectorValue(selectedValue);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(data.length / pageSize) - 1),
    );
  };

  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);
  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original);
  const visibleRows = disablePagination
    ? table.getFilteredRowModel().rows
    : table.getFilteredRowModel().rows.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className={appearance === "clean" ? "flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row" : "flex flex-col sm:flex-row gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-lg border border-gray-200 dark:border-gray-700"}>
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full sm:max-w-sm"
          disabled={isRefreshing}
        />
        {appearance !== "clean" && <select
          value={selectValue || ""}
          onChange={handleSelectChange}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 min-w-[150px] font-medium transition-all"
          disabled={isRefreshing}
        >
          <option value="">📊 Tous les statuts</option>
          <option value="Pending">⏳ En cours</option>
          <option value="Accepted">✅ Accepté</option>
          <option value="Declined">❌ Décliné</option>
        </select>}
        {appearance !== "clean" && <select
          value={sectorValue || ""}
          onChange={handleSectorChange}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 min-w-[150px] font-medium transition-all"
          disabled={isRefreshing}
        >
          <option value="">🏢 Tous les secteurs</option>
          {Array.isArray(sectors) && sectors.map((sector) => (
            <option key={sector.id} value={sector.name}>
              {sector.name}
            </option>
          ))}
        </select>}
      </div>
      {renderBulkActions && selectedRows.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-3">
          {renderBulkActions(selectedRows, () => table.resetRowSelection())}
        </div>
      )}
      <div className={appearance === "clean" ? "relative min-h-[360px] overflow-hidden rounded-lg border bg-background" : "rounded-xl border border-gray-200 dark:border-gray-700 relative min-h-[400px] overflow-hidden shadow-sm bg-white dark:bg-gray-800"}>
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-xl border-2 border-blue-500 dark:border-blue-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-t-2 border-blue-500 dark:border-blue-400"></div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Actualisation en cours...</span>
            </div>
          </div>
        )}
        <ScrollArea className="w-full">
          <div className="min-w-full overflow-x-auto">
            <Table className="relative min-w-full">
              <TableHeader className={appearance === "clean" ? "bg-muted/50" : "bg-gradient-to-r from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-900"}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b-2 border-gray-300 dark:border-gray-600">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap font-bold text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wider">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {visibleRows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      className={appearance === "clean" ? "border-b transition-colors hover:bg-muted/40" : `
                        transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                        ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-800/50'}
                        ${row.getIsSelected() ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                        border-b border-gray-200 dark:border-gray-700
                      `}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap py-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      {!disablePagination && (
      <div className={appearance === "clean" ? "flex flex-col items-center justify-between gap-3 border-t px-1 pt-4 sm:flex-row" : "flex items-center justify-between space-x-2 py-4 px-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 rounded-lg border border-gray-200 dark:border-gray-700"}>
        <div className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="inline-flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md font-semibold">
              {table.getFilteredSelectedRowModel().rows.length}
            </span>
            sur
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md font-semibold">
              {table.getFilteredRowModel().rows.length}
            </span>
            ligne(s) sélectionnée(s)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 transition-all"
          >
            ← Précédent
          </Button>
          <div className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-300">
            Page {currentPage + 1} / {Math.ceil(table.getFilteredRowModel().rows.length / pageSize) || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(data.length / pageSize) - 1}
            className="font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 transition-all"
          >
            Suivant →
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}
