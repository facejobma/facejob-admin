"use client";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/employee-tables/columns";
import { FC } from "react";
import { EntrepriseDataTable } from "@/components/ui/entreprise-table";
import { Heading } from "@/components/ui/heading";
import { EnterpriseData } from "@/types";
import { DataTable } from "@/components/ui/data-table";

interface EntrepriseProps {
  data: EnterpriseData[];
}

export const UserEnterprise: FC<EntrepriseProps> = ({ data }) => {

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Enterprises (${data.filter(entreprise => entreprise.is_verified == "Accepted").length})`}
          description="Management des enterprises"
        />
      </div>
      <Separator />
      <DataTable searchKey="company_name" columns={columns} data={data.filter(entreprise => entreprise.is_verified == "Accepted")} />
    </>
  );
};
