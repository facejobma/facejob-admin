"use client";

import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/employee-tables/columns";
import { FC } from "react";
import { EntrepriseDataTable } from "@/components/ui/entreprise-table";
import { Heading } from "@/components/ui/heading";
import { EnterpriseData } from "@/types";
import { Circles } from "react-loader-spinner";

interface ProductsClientProps {
  data: EnterpriseData[];
  // loading: boolean; // New prop for loading state
}

export const UserEnterprise: FC<ProductsClientProps> = ({ data = [] }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Enterprises (${data.length})`}
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
