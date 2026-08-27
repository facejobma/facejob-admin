"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/tables/employee-tables/columns";
import { EnterpriseData } from "@/types";
import { Building2, Inbox } from "lucide-react";

interface UserEnterpriseProps {
  data: EnterpriseData[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const UserEnterprise = ({ data, onRefresh, isRefreshing }: UserEnterpriseProps) => {
  if (data.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-muted p-4"><Inbox className="h-7 w-7 text-muted-foreground" /></div>
        <h3 className="font-semibold">Aucune entreprise trouvée</h3>
        <p className="mt-1 text-sm text-muted-foreground">Les entreprises correspondant à cette vue apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4" />{data.length} entreprise{data.length > 1 ? "s" : ""}</div>
      <DataTable searchKey="company_name" columns={columns} data={data} onRefresh={onRefresh} isRefreshing={isRefreshing} appearance="clean" />
    </div>
  );
};
