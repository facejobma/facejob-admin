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
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sectors`,
      {
        headers:{
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get("authToken")}`,
        }
      })
      .then((response) => response.json())
      .then((data) => {
        setSectors(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching secteur options:", error);
      });
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    table.getColumn(searchKey)?.setFilterValue(searchValue);
  }, [searchKey, searchValue, table]);

  useEffect(() => {
    table.setGlobalFilter(selectValue);
  }, [selectValue, table]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectValue(selectedValue);
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

  return (
    <>
      <div className="flex space-x-2">
        <Input
          placeholder={`Rechercher par ${searchKey}...`}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <select
          value={selectValue || ""}
          onChange={handleSelectChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 w-60"
        >
          <option value="Pending">En cours</option>
          <option value="Accepted">Accepté</option>
          <option value="Declined">Décliné</option>
        </select>
        <select
          value={selectValue || ""}
          onChange={handleSelectChange}
          className="border bg-white text-gray-500  p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50"
        >
          <option value="">Secteur</option>
          {sectors.map((sector) => (
            <option key={sector.id} value={sector.name}>
              {sector.name}
            </option>
          ))}
        </select>
      </div>
      <ScrollArea className="rounded-md border h-[calc(80vh-220px)]">
        <Table className="relative">
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
            {table
              .getFilteredRowModel()
              .rows.slice(startIndex, endIndex)
              .map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur {" "}
          {table.getFilteredRowModel().rows.length}  colonnes sélectionnée(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === Math.ceil(data.length / pageSize) - 1}
          >
            Suivant
          </Button>
        </div>
      </div>
    </>
  );
}
