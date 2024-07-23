import { ColumnDef } from "@tanstack/react-table";
import { Sales } from "@/types";
import { TableCell } from "@/components/ui/table";
import Image from "next/image";
import moment from "moment";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Sales>[] = [
  // {
  //   accessorKey: "entreprise",
  //   header: "Logo de l'entreprise",
  //   cell: ({ row }) => (
  //     <TableCell>
  //       <div className="w-10 h-10 relative rounded-full overflow-hidden">
  //         <Image
  //           src={row?.original?.entreprise.entreprise_logo}
  //           alt={`${row.original.entreprise.company_name} Logo`}
  //           layout="fill"
  //           objectFit="cover"
  //         />
  //       </div>
  //     </TableCell>
  //   )
  // },
  {
    accessorKey: "entreprise.id",
    header: "ID ",
  },
  {
    accessorKey: "entreprise.company_name",
    header: "Nom de l'entreprise",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  // {
  //   accessorKey: "description",
  //   header: "Description",
  //   enableColumnFilter: true,
  //   enableSorting: true,
  //   enableHiding: true
  // },
  {
    accessorKey: "entreprise.sector.name",
    header: "Secteur",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "entreprise.phone",
    header: "Téléphone",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "entreprise.email",
    header: "Email",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "plan.name",
    header: "Nom du plan",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "price",
    header: "Montant en DH",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "created_at",
    header: "Créé le",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    cell: ({ row }) => (
      <TableCell>
        {moment(row.original.created_at).format("DD/MM/YYYY")}
      </TableCell>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={
          row.original.status === "Accepted"
            ? "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center"
            : row.original.status === "Declined"
              ? "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center"
              : "bg-gray-200 text-gray-800 rounded-full py-1 px-2 text-center"
        }
      >
        {row.original.status}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />, 
  },
  // {
  //   accessorKey: "updated_at",
  //   header: "Mis à jour le",
  //   enableColumnFilter: true,
  //   enableSorting: true,
  //   enableHiding: true,
  //   cell: ({ row }) => (
  //     <TableCell>
  //       {moment(row.original.updated_at).format("DD/MM/YYYY")}
  //     </TableCell>
  //   )
  // }
];
