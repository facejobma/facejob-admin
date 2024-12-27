"use client";
// import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/request-tables/columns";
import { FC } from "react";
import { EnterpriseData } from "@/types";
import { EntrepriseDataTable } from "@/components/ui/entreprise-table";

interface EntrepriseProps {
  data: EnterpriseData[];
}

export const UserEnterprise: FC<EntrepriseProps> = ({ data }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Requests (${data.length})`}
          description="Validating the entreprise requests"
        />
      </div>
      <Separator />
      <EntrepriseDataTable searchKey="company_name" columns={columns} data={data} />
    </>
  );
};
