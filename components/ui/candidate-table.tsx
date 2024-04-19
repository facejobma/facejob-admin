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
import { Circles } from "react-loader-spinner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
}

interface OptionData {
  id: number;
  name: string;
}

export function CandidateDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
}: DataTableProps<TData, TValue>) {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [sectorOptions, setSectorOptions] = useState<OptionData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(true);

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sectors`)
      .then((response) => response.json())
      .then((data: OptionData[]) => {
        setSectorOptions(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        throw new Error("Error fetching sector options: " + error);
      });
  }, []);

  useEffect(() => {
    table.getColumn(searchKey)?.setFilterValue(searchValue);
  }, [searchKey, searchValue, table]);

  const handleSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value;
    setSelectValue(selectedValue);

    table.setGlobalFilter(selectedValue);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(data.length / pageSize) - 1)
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
          value={selectValue || ""}
          onChange={handleSelectChange}
          className="border bg-white text-gray-500  p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50"
        >
          <option value="">sector</option>
          {sectorOptions.map((option) => (
            <option key={option.id} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[calc(80vh-220px)]">
          <Circles
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : (
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
                            header.getContext()
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
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
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
              currentPage === Math.ceil(data.length / pageSize) - 1
            }
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
