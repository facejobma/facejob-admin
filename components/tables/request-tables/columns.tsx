import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { EnterpriseData } from "@/types";
import { Clock, CheckCircle, XCircle, Building2, Mail, Phone, Calendar, Briefcase, Crown, Zap, Star } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";
import { Badge } from "@/components/ui/badge";

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
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700">
          {logoUrl && typeof logoUrl === "string" ? (
            <Image
              src={logoUrl}
              alt={`${companyName} Logo`}
              width={48}
              height={48}
              className="object-cover"
              onError={(e) => {
                console.log("Image load error:", logoUrl);
                const target = e.currentTarget;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">${companyName.charAt(0).toUpperCase() || 'E'}</div>`;
                }
              }}
              unoptimized={logoUrl.includes('placeholder')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
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
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          <TruncatedCell 
            content={row.getValue("company_name")} 
            maxWidth="180px"
          />
        </div>
      </div>
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
        <div className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <TruncatedCell 
              content={sectorName} 
              maxWidth="120px"
            />
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "plan",
    header: "Plan",
    size: 140,
    cell: ({ row }) => {
      const plan = row.original.plan;
      const planName = plan?.name || 'Aucun plan';
      
      // Déterminer l'icône et le style selon le type de plan
      let icon = <Zap className="h-3 w-3" />;
      let badgeClass = "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";
      
      if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('pro')) {
        icon = <Crown className="h-3 w-3" />;
        badgeClass = "bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 border-amber-300 dark:from-yellow-900 dark:to-amber-900 dark:text-amber-300 dark:border-amber-700";
      } else if (planName.toLowerCase().includes('enterprise') || planName.toLowerCase().includes('business')) {
        icon = <Star className="h-3 w-3" />;
        badgeClass = "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300 dark:from-purple-900 dark:to-pink-900 dark:text-purple-300 dark:border-purple-700";
      } else if (planName !== 'Aucun plan') {
        badgeClass = "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-300 dark:border-blue-700";
      }
      
      return (
        <Badge variant="outline" className={`${badgeClass} font-medium flex items-center gap-1.5 w-fit`}>
          {icon}
          <span className="truncate max-w-[100px]">{planName}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "email",
    header: "EMAIL",
    size: 250,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          <TruncatedCell 
            content={row.getValue("email")} 
            maxWidth="220px"
          />
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "TEL",
    size: 140,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          <TruncatedCell 
            content={row.getValue("phone")} 
            maxWidth="110px"
          />
        </span>
      </div>
    ),
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
    size: 130,
    cell: ({ row }) => {
      const isVerified = row.original.is_verified;
      let status = "En attente";
      let className = "bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border-yellow-300 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-300 dark:border-yellow-700";
      let icon = <Clock className="h-3.5 w-3.5" />;
      
      if (isVerified === true || isVerified === "Accepted") {
        status = "Acceptée";
        className = "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-300 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-300 dark:border-green-700";
        icon = <CheckCircle className="h-3.5 w-3.5" />;
      } else if (isVerified === false || isVerified === "Declined") {
        status = "Refusée";
        className = "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-300 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-300 dark:border-red-700";
        icon = <XCircle className="h-3.5 w-3.5" />;
      }
      
      return (
        <Badge variant="outline" className={`${className} font-semibold flex items-center gap-1.5 w-fit px-3 py-1`}>
          {icon}
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date de création",
    size: 140,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {moment(row.original.created_at).format("DD/MM/YYYY")}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {moment(row.original.created_at).format("HH:mm")}
          </span>
        </div>
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
