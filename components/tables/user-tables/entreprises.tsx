"use client";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/employee-tables/columns";
import { FC } from "react";
import { EnterpriseData } from "@/types";
import { EntrepriseDataTable } from "@/components/ui/entreprise-table";

interface EntrepriseProps {
  data: EnterpriseData[];
}

export const UserEnterprise: FC<EntrepriseProps> = ({ data }) => {
  console.log("UserEnterprise received data:", data);
  console.log("Data length:", data.length);
  
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading  
          title={`Entreprises (${data.length})`}
          description="Management des enterprises"
        />
      </div>
      <Separator />
      <EntrepriseDataTable
        searchKey="company_name"
        columns={columns}
        data={data}
      />
    </>
  );
};
