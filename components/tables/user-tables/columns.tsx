"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import moment from "moment";
import "moment/locale/fr";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 50,
  },
  {
    accessorKey: "first_name",
    header: "NOM COMPLET",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 200,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("first_name")} 
        maxWidth="200px"
      />
    ),
  },
  {
    accessorKey: "sector",
    header: "SECTEUR",
    size: 150,
    cell: ({ row }) => {
      const sector = row.getValue("sector");
      const sectorName = typeof sector === 'object' && sector !== null 
        ? (sector as any).name 
        : sector;
      return (
        <TruncatedCell 
          content={sectorName} 
          maxWidth="150px"
        />
      );
    },
  },
  {
    accessorKey: "email",
    header: "EMAIL",
    size: 250,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("email")} 
        maxWidth="250px"
      />
    ),
  },
  {
    accessorKey: "tel",
    header: "TEL",
    size: 120,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("tel")} 
        maxWidth="120px"
      />
    ),
  },
  {
    accessorKey: "bio",
    header: "BIO",
    size: 300,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("bio")} 
        maxWidth="300px"
      />
    ),
  },
  {
    accessorKey: "created_at",
    header: "Date de creation",
    size: 120,
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {moment(row.original.created_at).format("DD/MM/yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
