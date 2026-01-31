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
  console.log("EnterpriseRequests - Received data:", data);
  console.log("EnterpriseRequests - Data length:", data.length);
  console.log("EnterpriseRequests - First item:", data[0]);
  
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Demandes (${data.length})`}
          description="Validation des demandes d'entreprises"
        />
      </div>
      <Separator />
      <DataTable searchKey="company_name" columns={columns} data={data} />
    </>
  );
};
