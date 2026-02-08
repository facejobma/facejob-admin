import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { CV } from "@/types";
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
    header: "Vidéo",
    cell: ({ row }) => (
      <div className="w-48 h-32 relative rounded-lg overflow-hidden bg-gray-900">
        <video 
          src={row.original.link} 
          className="w-full h-full object-contain"
          controls
          preload="metadata"
          playsInline
          muted={false}
        >
          <source src={row.original.link} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
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
      moment(row.original.created_at).format("DD/MM/yyyy")
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <CellAction data={row.original} onRefresh={table.options.meta?.onRefresh} />,
  },
];
