"use client";
import { Separator } from "@/components/ui/separator";
import { columns } from "@/components/tables/sales-tables/columns";
import { FC } from "react";
import { SalesDataTable } from "@/components/ui/sales-table";
import { Heading } from "@/components/ui/heading";
import { Sales } from "@/types";


interface ProductsClientProps {
  data: Sales[];
}

export const SalesTable: FC<ProductsClientProps> = ({ data }) => {

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Ventes (${data.length})`}
          description="Management des ventes"
        />
      </div>
      <Separator />
      <SalesDataTable searchKey="company_name" columns={columns} data={data} />
    </>
  );
};
