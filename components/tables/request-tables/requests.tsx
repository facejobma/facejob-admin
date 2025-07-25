"use client";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/request-tables/columns";
import { FC } from "react";
import { EnterpriseData } from "@/types";

interface EntrepriseProps {
  data: EnterpriseData[];
}

export const EnterpriseRequests: FC<EntrepriseProps> = ({ data }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Requests (${data.filter(entreprise => entreprise.is_verified == "Pending").length})`}
          description="Validating the entreprise requests"
        />
      </div>
      <Separator />
      <DataTable searchKey="company_name" columns={columns} data={data} />
    </>
  );
};
