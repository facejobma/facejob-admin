"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TableCell } from "@/components/ui/table";
import Image from "next/image";
import { EnterpriseData } from "@/types";
import moment from "moment";
import "moment/locale/fr";

moment.locales();

export const columns: ColumnDef<EnterpriseData>[] = [
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
    enableHiding: false
  },
  {
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => (
      <TableCell>
        <div className="w-10 h-10 relative rounded-full overflow-hidden">
          {row.original && <Image
            src={row.original.logo}
            alt={`${row.original.company_name} Logo`}
            layout="fill"
            objectFit="cover"
          />}
        </div>
      </TableCell>
    )
  },
  {
    accessorKey: "id",
    header: "Id",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: "company_name",
    header: "Nom de l'entreprise",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: "plan_name",
    header: "Panel",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  // {
  //   accessorKey: "plan_start_data",
  //   header: "Date d'angagement",
  //   enableColumnFilter: true,
  //   enableSorting: true,
  //   enableHiding: true,
  // },
  // {
  //   accessorKey: "plan_end_data",
  //   header: "Date de fin",
  //   enableColumnFilter: true,
  //   enableSorting: true,
  //   enableHiding: true,
  // },
  {
    accessorKey: "created_at",
    header: "Date de creation",
    cell: ({ row }) => (
      <TableCell>{moment(row.original.created_at).fromNow()}</TableCell>
    )
  },

  {
    accessorKey: "sector.name",
    header: "Secteur",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "phone",
    header: "Tel"
  },
  {
    accessorKey: "effectif",
    header: "Effectif"
  },

  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
