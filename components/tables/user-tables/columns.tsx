"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/types";
import { TruncatedCell } from "@/components/ui/truncated-cell";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import moment from "moment";
import "moment/locale/fr";
import { CheckCircle, XCircle, Mail, Phone } from "lucide-react";

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
    size: 50,
  },
  {
    accessorKey: "first_name",
    header: "CANDIDAT",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 280,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center space-x-3 min-w-0">
          <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-700 flex-shrink-0">
            <AvatarImage src={user.profile_picture || ""} alt={user.first_name} />
            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {user.first_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {user.first_name} {user.last_name}
            </span>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <Mail className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "sector",
    header: "SECTEUR",
    size: 150,
    cell: ({ row }) => {
      const sector = row.getValue("sector");
      const sectorName = typeof sector === 'object' && sector !== null 
        ? (sector as any).name 
        : sector;
      return sectorName ? (
        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
          {sectorName}
        </Badge>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">Non défini</span>
      );
    },
  },
  {
    accessorKey: "tel",
    header: "CONTACT",
    size: 150,
    cell: ({ row }) => {
      const tel = row.getValue("tel") as string;
      return tel ? (
        <div className="flex items-center space-x-2 text-sm">
          <Phone className="h-3 w-3 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{tel}</span>
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">Non renseigné</span>
      );
    },
  },
  {
    accessorKey: "email_verified_at",
    header: "STATUT",
    size: 120,
    cell: ({ row }) => {
      const isVerified = row.getValue("email_verified_at");
      return (
        <div className="flex items-center space-x-2">
          {isVerified ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge variant="default" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                Actif
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-500" />
              <Badge variant="destructive" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                Inactif
              </Badge>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "bio",
    header: "DESCRIPTION",
    size: 300,
    cell: ({ row }) => {
      const bio = row.getValue("bio") as string;
      return bio ? (
        <TruncatedCell 
          content={bio} 
          maxWidth="300px"
          className="text-gray-600 dark:text-gray-400"
        />
      ) : (
        <span className="text-gray-400 dark:text-gray-500 italic">Aucune description</span>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "INSCRIPTION",
    size: 120,
    cell: ({ row }) => {
      const date = moment(row.original.created_at);
      return (
        <div className="flex flex-col text-sm">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {date.format("DD/MM/YYYY")}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {date.fromNow()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
