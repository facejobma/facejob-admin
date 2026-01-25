import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { EnterpriseData } from "@/types";
import moment from "moment";
import "moment/locale/fr";

export const columns: ColumnDef<
  EnterpriseData,
  Dispatch<SetStateAction<EnterpriseData[]>>
>[] = [
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
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => (
      <div className="w-10 h-10 relative rounded-full overflow-hidden">
        {row.original?.logo && typeof row.original.logo === "string" && (
          <Image
            src={
              row.original.logo.startsWith("/")
                ? row.original.logo
                : `/${row.original.logo}`
            }
            alt={`${row.original.company_name} Logo`}
            layout="fill"
            objectFit="cover"
          />
        )}
      </div>
    ),
  },

  // {
  //   accessorKey: "logo",
  //   header: "Logo",
  //   cell: ({ row }) => (
  //     <TableCell>
  //       <div className="w-10 h-10 relative rounded-full overflow-hidden">
  //         {row.original?.logo && <Image
  //           src={row.original.logo}
  //           alt={`${row.original.company_name} Logo`}
  //           layout="fill"
  //           objectFit="cover"
  //         />}
  //       </div>
  //     </TableCell>
  //   )
  // },
  {
    accessorKey: "company_name",
    header: "Nom de l'Entreprise",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "sector.name",
    header: "Secteur"
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "phone",
    header: "TEL",
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
      moment(row.original.created_at).format("DD/MM/yyyy")
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
