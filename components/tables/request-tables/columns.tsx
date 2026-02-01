import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { EnterpriseData } from "@/types";
import { Clock, CheckCircle, XCircle } from "lucide-react";
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
      const logoUrl = row.original?.logo;
      const companyName = row.original?.company_name || '';
      
      return (
        <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          {logoUrl && typeof logoUrl === "string" ? (
            <Image
              src={logoUrl}
              alt={`${companyName} Logo`}
              width={40}
              height={40}
              className="object-cover rounded-full"
              onError={(e) => {
                console.log("Image load error:", logoUrl);
                // Hide the image and show fallback
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 bg-green-100">${companyName.charAt(0).toUpperCase() || 'E'}</div>`;
                }
              }}
              unoptimized={logoUrl.includes('placeholder')} // Disable optimization for placeholder images
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600 bg-green-100">
              {companyName.charAt(0).toUpperCase() || 'E'}
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
      let className = "bg-yellow-100 text-yellow-800 border-yellow-200 rounded-full py-1 px-3 text-center text-xs font-medium border";
      let icon = <Clock className="h-3 w-3 mr-1" />;
      
      if (isVerified === true || isVerified === "Accepted") {
        status = "Acceptée";
        className = "bg-green-100 text-green-800 border-green-200 rounded-full py-1 px-3 text-center text-xs font-medium border";
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
      } else if (isVerified === false || isVerified === "Declined") {
        status = "Refusée";
        className = "bg-red-100 text-red-800 border-red-200 rounded-full py-1 px-3 text-center text-xs font-medium border";
        icon = <XCircle className="h-3 w-3 mr-1" />;
      }
      
      return (
        <div className={className}>
          <div className="flex items-center justify-center">
            {icon}
            {status}
          </div>
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
