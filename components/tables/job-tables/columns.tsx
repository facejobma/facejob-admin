import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TableCell } from "@/components/ui/table";
import { Job } from "@/types";
import moment from "moment";
import "moment/locale/fr";

// import { TableCell } from "@/components/ui/table";
// import Image from "next/image";

export const columns: ColumnDef<Job>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "titre",
    header: "TITRE",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "company_name",
    header: "ENTREPRISE",
  },
  {
    accessorKey: "sector_name",
    header: "Secteur",
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
    cell: ({ row }) => (
      <div
        className={
          row.original.is_verified === "Accepted"
            ? "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center"
            : row.original.is_verified === "Declined"
              ? "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center"
              : "bg-gray-200 text-gray-800 rounded-full py-1 px-2 text-center"
        }
      >
        {row.original.is_verified}
      </div>
    ),
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
