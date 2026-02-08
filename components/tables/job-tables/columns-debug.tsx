import { ColumnDef } from "@tanstack/react-table";
import { Job } from "@/types";

// Simplified columns for debugging jobs
export const debugJobColumns: ColumnDef<Job>[] = [
  {
    accessorKey: "titre",
    header: "Titre",
    cell: ({ row }) => {
      console.log("Rendering titre:", row.original.titre);
      return <div>{row.original.titre || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "company_name",
    header: "Entreprise",
    cell: ({ row }) => {
      console.log("Rendering company_name:", row.original.company_name);
      return <div>{row.original.company_name || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "sector_name",
    header: "Secteur",
    cell: ({ row }) => {
      console.log("Rendering sector_name:", row.original.sector_name);
      return <div>{row.original.sector_name || 'N/A'}</div>;
    },
  },
  {
    header: "Statut",
    cell: ({ row }) => {
      console.log("Rendering is_verified:", row.original.is_verified);
      return <div>{String(row.original.is_verified)}</div>;
    },
  },
  {
    header: "Raw Data",
    cell: ({ row }) => {
      console.log("Full row data:", row.original);
      return <div className="text-xs">Voir console</div>;
    },
  },
];