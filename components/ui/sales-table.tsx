"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
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
import { Sales } from "@/types";
import { Loader2, Search } from "lucide-react";

interface SalesDataTableProps<TValue> {
  columns: ColumnDef<Sales, TValue>[];
  data: Sales[];
  isLoading?: boolean;
}

const normalize = (value: unknown) =>
  String(value ?? "").toLocaleLowerCase("fr");

export function SalesDataTable<TValue>({
  columns,
  data,
  isLoading = false,
}: SalesDataTableProps<TValue>) {
  const [searchValue, setSearchValue] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const planOptions = useMemo(
    () =>
      Array.from(
        new Set(data.map((payment) => payment.plan?.name).filter(Boolean)),
      ).sort(),
    [data],
  );

  const filteredData = useMemo(() => {
    const query = normalize(searchValue.trim());

    return data.filter((payment) => {
      const matchesSearch =
        !query ||
        [
          payment.id,
          payment.entreprise?.company_name,
          payment.entreprise?.email,
          payment.entreprise?.phone,
          payment.entreprise?.sector?.name,
          payment.plan?.name,
        ].some((value) => normalize(value).includes(query));

      const matchesPlan = !planFilter || payment.plan?.name === planFilter;

      return matchesSearch && matchesPlan;
    });
  }, [data, planFilter, searchValue]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    setCurrentPage(0);
  }, [data, searchValue, planFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const visibleRows = table.getRowModel().rows.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-[minmax(260px,1fr)_220px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Rechercher une demande"
            placeholder="Entreprise, email, téléphone, secteur ou plan..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="pl-9"
          />
        </div>

        <select
          aria-label="Filtrer par plan"
          value={planFilter}
          onChange={(event) => setPlanFilter(event.target.value)}
          className="rounded-md border bg-white p-2 text-sm text-gray-700 focus:border-accent focus:outline-none focus:ring focus:ring-accent"
        >
          <option value="">Tous les plans</option>
          {planOptions.map((planName) => (
            <option key={planName} value={planName}>
              {planName}
            </option>
          ))}
        </select>
      </div>

      <ScrollArea className="h-[calc(80vh-220px)] min-h-[360px] rounded-md border">
        <Table className="relative min-w-[1050px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Chargement des demandes...
                  </span>
                </TableCell>
              </TableRow>
            ) : visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center text-muted-foreground"
                >
                  Aucune demande ne correspond aux filtres sélectionnés.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>
          {filteredData.length === 0
            ? "0 résultat"
            : `${startIndex + 1}–${endIndex} sur ${filteredData.length} demande(s)`}
        </span>
        <div className="flex items-center gap-2">
          <span>
            Page {Math.min(currentPage + 1, pageCount)} sur {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
            disabled={currentPage === 0}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((page) => Math.min(page + 1, pageCount - 1))
            }
            disabled={currentPage >= pageCount - 1}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
