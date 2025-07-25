import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { CV } from "@/types";
import { TableCell } from "@/components/ui/table";
import moment from "moment";
import "moment/locale/fr";

export const columns: ColumnDef<CV>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selctionner tout"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selectionner une ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "link",
    header: "Vidéos",
    // cell: ({ row }) => (
    //   <TableCell>
    //     <div className="w-10 h-10 relative rounded-full overflow-hidden">
    //       <Image
    //         src={row.original.logo}
    //         alt={`${row.original.company_name} Logo`}
    //         layout="fill"
    //         objectFit="cover"
    //       />
    //     </div>
    //   </TableCell>
    // ),
  },
  {
    accessorKey: "candidat_name",
    header: "Candidats",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "secteur_name",
    header: "Secteur",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "is_verified",
    header: "Status",
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
