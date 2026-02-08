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
import { EnterpriseData, Sector } from "@/types";
import Cookies from "js-cookie";

interface DataTableProps {
  columns: ColumnDef<EnterpriseData, any>[];
  data: EnterpriseData[];
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
  const [selectStatusValue, setSelectStatusValue] = useState<string>("");

  const statusOptions = [
    { value: "Accepted", label: "Acceptées" },
    { value: "Declined", label: "Refusées" },
    { value: "Pending", label: "En attente" },
  ];
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [filteredData, setFilteredData] = useState<EnterpriseData[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        // Handle both array and object responses
        const sectorsData = Array.isArray(result) ? result : (result.data || []);
        setSectors(sectorsData);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching secteur options:", error);
        setSectors([]); // Set empty array on error
      });
  }, []);

  useEffect(() => {
    let filtered = data.filter((entreprise) =>
      entreprise.company_name.toLowerCase().includes(searchValue.toLowerCase()),
    );

    if (selectValue) {
      filtered = filtered.filter(
        (entreprise) => entreprise.sector?.name === selectValue,
      );
    }

    if (selectPanValue) {
      filtered = filtered.filter(
        (entreprise) => entreprise.plan?.name === selectPanValue,
      );
    }
    
    if (selectStatusValue) {
      if (selectStatusValue === "Accepted") {
        filtered = filtered.filter(
          (entreprise) => entreprise.is_verified === true || entreprise.is_verified === "Accepted"
        );
      } else if (selectStatusValue === "Declined") {
        filtered = filtered.filter(
          (entreprise) => entreprise.is_verified === false || entreprise.is_verified === "Declined"
        );
      } else if (selectStatusValue === "Pending") {
        filtered = filtered.filter(
          (entreprise) => 
            entreprise.is_verified !== true && 
            entreprise.is_verified !== "Accepted" && 
            entreprise.is_verified !== false && 
            entreprise.is_verified !== "Declined"
        );
      }
    }
    
    if (selectEffectifValue) {
      // Handle effectif filtering for both string and number values
      if (selectEffectifValue === "> 500") {
        filtered = filtered.filter((entreprise) => {
          const effectif = entreprise.effectif;
          if (typeof effectif === 'string') {
            return effectif.includes('+') || effectif.includes('1000');
          }
          return effectif > 500;
        });
      } else {
        const [min, max] = selectEffectifValue.split(" - ").map(Number);
        filtered = filtered.filter((entreprise) => {
          const effectif = entreprise.effectif;
          if (typeof effectif === 'string') {
            // Try to extract number from string like "200-500"
            const numMatch = effectif.match(/\d+/);
            if (numMatch) {
              const num = parseInt(numMatch[0]);
              return num >= min && num <= max;
            }
            return false;
          }
          return effectif >= min && effectif <= max;
        });
      }
    }
    
    console.log("Filtered data:", filtered);
    setFilteredData(filtered);
  }, [data, searchValue, selectValue, selectPanValue, selectEffectifValue, selectStatusValue]);

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

  const handleSelectStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;
    setSelectStatusValue(selectedValue);
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder={`Search ${searchKey}...`}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <select
          value={selectPanValue || ""}
          onChange={handleSelectPannelChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 min-w-[120px]"
        >
          <option value="">Tous les plans</option>
          {planOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={selectValue || ""}
          onChange={handleSelectChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 min-w-[120px]"
        >
          <option value="">Tous les secteurs</option>
          {Array.isArray(sectors) && sectors.map((sector) => (
            <option key={sector.id} value={sector.name}>
              {sector.name}
            </option>
          ))}
        </select>
        <select
          value={selectStatusValue || ""}
          onChange={handleSelectStatusChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 min-w-[120px]"
        >
          <option value="">Tous les statuts</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={selectEffectifValue || ""}
          onChange={handleSelectEffectifChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 min-w-[120px]"
        >
          <option value="">Tous les effectifs</option>
          {effectifOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="rounded-md border">
        <ScrollArea className="h-[calc(80vh-220px)] w-full">
          <div className="min-w-full overflow-x-auto">
            <Table className="relative min-w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
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
                {table.getFilteredRowModel().rows.length > 0 ? (
                  table
                    .getFilteredRowModel()
                    .rows.slice(startIndex, endIndex)
                    .map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() ? "selected" : undefined}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="whitespace-nowrap">
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
                    <TableCell colSpan={columns.length} className="text-center">
                      Aucune donnée disponible.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="flex items-center space-x-2">
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
            disabled={
              currentPage === Math.ceil(filteredData.length / pageSize) - 1
            }
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
