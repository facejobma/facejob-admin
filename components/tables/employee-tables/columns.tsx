import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
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
    size: 50,
  },
  {
    accessorKey: "logo",
    header: "Logo",
    size: 80,
    cell: ({ row }) => {
      const [imageError, setImageError] = useState(false);
      
      return (
        <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-gray-100 border">
          {row.original?.logo && typeof row.original.logo === "string" && !imageError ? (
            <Image
              src={
                row.original.logo.startsWith("http") 
                  ? row.original.logo
                  : row.original.logo.startsWith("/")
                  ? row.original.logo
                  : `/${row.original.logo}`
              }
              alt={`${row.original.company_name} Logo`}
              fill
              className="object-cover"
              onError={() => {
                console.log("Image load error for:", row.original.logo);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-50">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "company_name",
    header: "Nom de l'Entreprise",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 200,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("company_name")} 
        maxWidth="200px"
      />
    ),
  },
  {
    accessorKey: "plan",
    header: "Plan",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 150,
    cell: ({ row }) => {
      const plan = row.original.plan;
      const planName = plan?.name || 'Aucun plan';
      return (
        <TruncatedCell 
          content={planName} 
          maxWidth="150px"
        />
      );
    },
  },
  {
    accessorKey: "sector",
    header: "Secteur",
    size: 150,
    cell: ({ row }) => {
      const sector = row.original.sector;
      const sectorName = sector?.name || 'Non défini';
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
    accessorKey: "phone",
    header: "TEL",
    size: 120,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("phone")} 
        maxWidth="120px"
      />
    ),
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
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
    header: "Date de création",
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
