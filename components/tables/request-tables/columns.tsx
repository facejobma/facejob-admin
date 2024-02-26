import { Checkbox } from "@/components/ui/checkbox";
import { Entreprise } from "@/constants/data";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export const columns: ColumnDef<Entreprise>[] = [
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
  },
  {
    accessorKey: "company_name",
    header: "Company Name",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "secteur",
    header: "SECTEUR",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "phone",
    header: "TEL",
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    // cell: ({ value }) => (
    //   <span
    //     className={
    //       value === "Accepted"
    //         ? "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center"
    //         : value === "Declined"
    //         ? "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center"
    //         : "text-gray-600" // Default style for other values
    //     }
    //   >
    //     {value}
    //   </span>
    // ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
