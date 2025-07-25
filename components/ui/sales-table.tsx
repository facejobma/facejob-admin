import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
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



 interface Sector {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
}

export function SalesDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [selectPanValue, setSelectPanValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sectors`)
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

  const planOptions = [
    "Pannel gratuit",
    "Pannel de base",
    "Pannel Intérmédiare",
    "Pannel Essentiel",
    "Pannel premium",
  ];

  useEffect(() => {
    table.getColumn(searchKey)?.setFilterValue(searchValue);
  }, [searchKey, searchValue, selectPanValue, table]);

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectValue(selectedValue);

    table.setGlobalFilter(selectedValue);
  };

  const handleSelectPannelChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;
    setSelectPanValue(selectedValue);

    table.setGlobalFilter(selectedValue);
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
          placeholder={`Search ${searchKey}...`}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <select
          value={selectPanValue || ""}
          onChange={handleSelectPannelChange}
          className="border bg-white text-gray-500  p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50"
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
            {/* Header rows */}
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
            {/* Render rows for the current page */}
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
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} colonnes sélectionnée(s).
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
