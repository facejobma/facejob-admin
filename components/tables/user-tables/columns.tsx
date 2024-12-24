"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types";
import { TableCell } from "@/components/ui/table";
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
  },
  {
    accessorKey: "first_name",
    header: "NOM COMPLET",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "sector",
    header: "secteur",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "tel",
    header: "TEL",
  },
  {
    accessorKey: "bio",
    header: "BIO",
  },
  {
    accessorKey: "created_at",
    header: "Date de creation",
    cell: ({ row }) => (
      <TableCell>
        {moment(row.original.created_at).format("DD/MM/yyyy")}
      </TableCell>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
