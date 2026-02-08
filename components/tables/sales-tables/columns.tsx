import { ColumnDef } from "@tanstack/react-table";
import { Sales } from "@/types";
import moment from "moment";
import { CellAction } from "./cell-action";
import { TruncatedCell } from "@/components/ui/truncated-cell";

export const columns: ColumnDef<Sales>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 80,
  },
  {
    accessorKey: "reference",
    header: "Référence",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 200,
    cell: ({ row }) => (
      <TruncatedCell 
        content={row.getValue("reference")} 
        maxWidth="200px"
      />
    ),
  },
  {
    accessorKey: "price",
    header: "Montant (DH)",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 120,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {parseFloat(row.getValue("price")).toFixed(2)} DH
      </div>
    ),
  },
  {
    accessorKey: "payment_method",
    header: "Méthode de paiement",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 150,
    cell: ({ row }) => {
      const method = row.getValue("payment_method") as string;
      const displayMethod = method === "credit_card" ? "Carte de crédit" : 
                           method === "bank_transfer" ? "Virement bancaire" :
                           method === "paypal" ? "PayPal" : method;
      return (
        <TruncatedCell 
          content={displayMethod} 
          maxWidth="150px"
        />
      );
    },
  },
  {
    accessorKey: "payment_period",
    header: "Période",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 100,
    cell: ({ row }) => {
      const period = row.getValue("payment_period") as string;
      const displayPeriod = period === "monthly" ? "Mensuel" : 
                           period === "quarterly" ? "Trimestriel" :
                           period === "annual" ? "Annuel" : period;
      return (
        <div className="text-center">
          {displayPeriod}
        </div>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Date début",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 120,
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {moment(row.getValue("start_date")).format("DD/MM/YYYY")}
      </div>
    ),
  },
  {
    accessorKey: "end_date",
    header: "Date fin",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 120,
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {moment(row.getValue("end_date")).format("DD/MM/YYYY")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    size: 120,
    cell: ({ row }) => {
      const status = row.original.status;
      let displayStatus = "En cours";
      let className = "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center text-xs";
      
      if (status === "Accepted") {
        displayStatus = "Accepté";
        className = "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center text-xs";
      } else if (status === "Declined") {
        displayStatus = "Décliné";
        className = "bg-red-200 text-red-800 rounded-full py-1 px-2 text-center text-xs";
      } else if (status === "Pending") {
        displayStatus = "En attente";
        className = "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center text-xs";
      }
      
      return (
        <div className={className}>
          {displayStatus}
        </div>
      );
    },
  },
  {
    accessorKey: "contact_access_consumed",
    header: "Accès consommés",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
    size: 120,
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("contact_access_consumed")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    size: 80,
    cell: ({ row }) => <CellAction data={row.original} />
  }
];