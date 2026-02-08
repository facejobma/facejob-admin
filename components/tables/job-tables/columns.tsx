import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/types";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  FileText,
  Users
} from "lucide-react";
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
    accessorKey: "sector_name",
    header: "Secteur",
    enableColumnFilter: true,
    enableSorting: false,
    enableHiding: true,
    size: 0,
    cell: () => null, // Hidden column for filtering
  },
  {
    accessorKey: "titre",
    header: "Offre d'emploi",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 350,
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 relative rounded-lg overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate max-w-[280px]" title={job.titre}>
              {job.titre}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Building2 className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={job.company_name}>
                {job.company_name}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {job.sector_name || 'Secteur non défini'}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "location_contract",
    header: "Localisation & Type",
    size: 180,
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className="space-y-2">
          {job.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm truncate max-w-[140px]" title={job.location}>
                {job.location}
              </span>
            </div>
          )}
          {job.contractType && (
            <Badge variant="outline" className="text-xs">
              {job.contractType}
            </Badge>
          )}
          {!job.location && !job.contractType && (
            <span className="text-xs text-muted-foreground">Non spécifié</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dates",
    header: "Période",
    size: 160,
    cell: ({ row }) => {
      const job = row.original;
      const startDate = job.date_debut ? moment(job.date_debut) : null;
      const endDate = job.date_fin ? moment(job.date_fin) : null;
      
      return (
        <div className="space-y-1">
          {startDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">
                Début: {startDate.format("DD/MM/YY")}
              </span>
            </div>
          )}
          {endDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-red-600" />
              <span className="text-xs text-red-600">
                Fin: {endDate.format("DD/MM/YY")}
              </span>
            </div>
          )}
          {!startDate && !endDate && (
            <span className="text-xs text-muted-foreground">Dates non définies</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
    size: 130,
    cell: ({ row }) => {
      const isVerified = row.original.is_verified;
      
      if (isVerified === true || isVerified === "Accepted") {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Publiée
          </Badge>
        );
      } else if (isVerified === false || isVerified === "Declined") {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Refusée
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      }
    },
  },
  {
    accessorKey: "created_at",
    header: "Date de création",
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
