import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Job } from "@/types";
import moment from "moment";
import "moment/locale/fr";

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
    size: 50,
  },
  {
    accessorKey: "titre",
    header: "TITRE",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 300,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("titre")} 
        maxWidth="300px"
      />
    ),
  },
  {
    accessorKey: "company_name",
    header: "ENTREPRISE",
    size: 200,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("company_name")} 
        maxWidth="200px"
      />
    ),
  },
  {
    accessorKey: "sector_name",
    header: "SECTEUR",
    size: 150,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("sector_name")} 
        maxWidth="150px"
      />
    ),
  },
  {
    accessorKey: "location",
    header: "LIEU",
    size: 120,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("location") || 'Non spécifié'} 
        maxWidth="120px"
      />
    ),
  },
  {
    accessorKey: "contractType",
    header: "TYPE",
    size: 80,
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("contractType") || 'N/A'}
      </div>
    ),
  },
  {
    accessorKey: "is_verified",
    header: "STATUT",
    size: 120,
    cell: ({ row }) => {
      const isVerified = row.original.is_verified;
      let status = "En attente";
      let className = "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center text-xs";
      
      if (isVerified === true || isVerified === "Accepted") {
        status = "Accepté";
        className = "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center text-xs";
      } else if (isVerified === false || isVerified === "Declined") {
        status = "Refusé";
        className = "bg-red-200 text-red-800 rounded-full py-1 px-2 text-center text-xs";
      }
      
      return (
        <div className={className}>
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "DATE CRÉATION",
    size: 120,
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {moment(row.original.created_at).format("DD/MM/yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
