import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { EnterpriseData, User } from "@/types";
import moment from "moment";
import "moment/locale/fr";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, Clock, XCircle, Star, Users, User as UserIcon, Mail, Phone } from "lucide-react";

// Colonnes pour les candidats
export const columns: ColumnDef<User>[] = [
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
    accessorKey: "candidate_info",
    header: "Candidat",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 250,
    cell: ({ row }) => {
      const user = row.original as any; // Type étendu pour les propriétés supplémentaires
      return (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={`${user.first_name || user.nomComplete} Avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.nomComplete || 'Nom non défini'}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {typeof user.sector === 'object' ? user.sector?.name : user.sector || 'Secteur non défini'}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 200,
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <TruncatedCell 
          content={row.getValue("email")} 
          maxWidth="180px"
        />
      </div>
    ),
  },
  {
    accessorKey: "tel",
    header: "Téléphone",
    size: 140,
    cell: ({ row }) => {
      const phone = row.getValue("tel") as string;
      return phone ? (
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{phone}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Non renseigné</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    size: 120,
    cell: ({ row }) => {
      const user = row.original as any;
      const isVerified = user.email_verified_at;
      
      if (isVerified) {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Inactif
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "bio",
    header: "Bio",
    size: 200,
    cell: ({ row }) => {
      const bio = row.getValue("bio") as string;
      return bio ? (
        <TruncatedCell 
          content={bio} 
          maxWidth="180px"
        />
      ) : (
        <span className="text-xs text-muted-foreground">Aucune bio</span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date d'inscription",
    size: 140,
    cell: ({ row }) => (
      <div className="text-sm">
        {moment(row.getValue("created_at")).format("DD/MM/YYYY")}
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

// Colonnes pour les entreprises (conservées pour compatibilité)
export const enterpriseColumns: ColumnDef<
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
    accessorKey: "company_info",
    header: "Entreprise",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 280,
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 border">
          {row.original?.logo && typeof row.original.logo === "string" ? (
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
              onError={(e) => {
                console.log("Enterprise logo load error for:", row.original.logo);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {row.original.company_name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {row.original.sector?.name || 'Secteur non défini'}
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Users className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {row.original.effectif} employés
            </span>
          </div>
        </div>
      </div>
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
      if (!plan) {
        return (
          <Badge variant="outline" className="text-xs">
            Aucun plan
          </Badge>
        );
      }
      
      return (
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <Badge variant="secondary" className="text-xs">
            {plan.name}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "contact_info",
    header: "Contact",
    size: 220,
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="text-sm truncate max-w-[200px]" title={row.original.email}>
          {row.original.email}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.phone}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Localisation",
    size: 180,
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.city && (
          <div className="text-sm font-medium">{row.original.city}</div>
        )}
        <div className="text-xs text-muted-foreground truncate max-w-[160px]" title={row.original.adresse}>
          {row.original.adresse}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
    size: 120,
    cell: ({ row }) => {
      const isVerified = row.original.is_verified;
      
      if (isVerified === true || isVerified === "Accepted") {
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Acceptée
          </Badge>
        );
      } else if (isVerified === false || isVerified === "Declined") {
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Refusée
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "created_at",
    header: "Date d'inscription",
    size: 140,
    cell: ({ row }) => (
      <div className="text-sm">
        {moment(row.original.created_at).format("DD/MM/YYYY")}
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