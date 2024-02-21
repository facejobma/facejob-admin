"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Entreprise } from "@/constants/data";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "@/components/tables/employee-tables/columns";
import { FC } from "react";

interface ProductsClientProps {
  data: Entreprise[];
}

export const UserEnterprise: FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading title={`Enterprises (${data.length})`} description="Management des enterprises" />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/user/update`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Changer les informations Enterprise
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
