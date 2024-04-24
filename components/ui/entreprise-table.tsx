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
import { Entreprise } from "@/types";

interface DataTableProps {
  columns: ColumnDef<Entreprise, any>[];
  data: Entreprise[];
  searchKey: string;
}

export function EntrepriseDataTable({
  columns,
  data,
  searchKey,
}: DataTableProps) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [selectPanValue, setSelectPanValue] = useState<string>("");
  const [selectEffectifValue, setSelectEffectifValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [filteredData, setFilteredData] = useState<Entreprise[]>([]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const effectifOptions = [
    "0 - 10",
    "10 - 50",
    "50 - 100",
    "100 - 500",
    "> 500",
  ];

  const planOptions = [
    "Pannel gratuit",
    "Pannel de base",
    "Pannel Intérmédiare",
    "Pannel Essentiel",
    "Pannel premium",
  ];

  // get all sectors from the table
  const sectors = Array.from(
    new Set(data.map((item) => (item as { sector: string }).sector)),
  );

  useEffect(() => {
    let filtered = data.filter((entreprise) =>
      entreprise.company_name.toLowerCase().includes(searchValue.toLowerCase()),
    );

    if (selectValue) {
      filtered = filtered.filter(
        (entreprise) => entreprise.sector === selectValue,
      );
    }

    if (selectPanValue) {
      filtered = filtered.filter(
        (entreprise) => entreprise.plan_name === selectPanValue,
      );
    }
    if (selectEffectifValue) {
      const [min, max] = selectEffectifValue.split(" - ").map(Number);
      filtered = filtered.filter(
        (entreprise) =>
          entreprise.effectif >= min && entreprise.effectif <= max,
      );
    }
    setFilteredData(filtered);
  }, [data, searchValue, selectValue, selectPanValue, selectEffectifValue]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectValue(selectedValue);
  };

  const handleSelectPannelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;
    setSelectPanValue(selectedValue);
  };

  const handleSelectEffectifChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;
    setSelectEffectifValue(selectedValue);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(filteredData.length / pageSize) - 1),
    );
  };

  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);

  return (
    <>
      <div className="flex space-x-2">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <select
          value={selectPanValue || ""}
          onChange={handleSelectPannelChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50"
        >
          <option value="">Pannel</option>
          {planOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={selectValue || ""}
          onChange={handleSelectChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50"
        >
          <option value="">Secteur</option>
          {sectors.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={selectEffectifValue || ""}
          onChange={handleSelectEffectifChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50"
        >
          <option value="">Effectif</option>
          {effectifOptions.map((option) => (
            <option key={option} value={option}>
              {option}
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
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={
              currentPage === Math.ceil(filteredData.length / pageSize) - 1
            }
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
