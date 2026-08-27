"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { EnterpriseData } from "@/types";
import { Building2, Inbox } from "lucide-react";

interface EnterpriseRequestsProps {
  data: EnterpriseData[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const EnterpriseRequests = ({ data, onRefresh, isRefreshing }: EnterpriseRequestsProps) => {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <Inbox className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">Aucune demande dans cette vue</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Modifiez le statut sélectionné ou revenez à toutes les demandes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>{data.length} résultat{data.length > 1 ? "s" : ""}</span>
      </div>
      <DataTable
        searchKey="company_name"
        columns={columns}
        data={data}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        appearance="clean"
      />
    </div>
  );
};
