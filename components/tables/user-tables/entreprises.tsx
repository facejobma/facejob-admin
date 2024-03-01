"use client";
import { Separator } from "@/components/ui/separator";
import { Entreprise } from "@/constants/data";
import { columns } from "@/components/tables/employee-tables/columns";
import { FC } from "react";
import { EntrepriseDataTable } from "@/components/ui/entreprise-table";

interface ProductsClientProps {
  data: Entreprise[];
}

export const UserEnterprise: FC<ProductsClientProps> = ({ data }) => {
  // const router = useRouter();

  return (
    <>
      {/* <div className="flex items-start justify-between">
        <Heading
          title={`Enterprises (${data.length})`}
          description="Management des enterprises"
        />
        <Button
          className="text-xs md:text-sm"
          onClick={() => router.push(`/dashboard/user/update`)}
        >
          <Plus className="mr-2 h-4 w-4" /> Changer les informations Enterprise
        </Button>
      </div> */}
      <Separator />
      <EntrepriseDataTable searchKey="company_name" columns={columns} data={data} />
    </>
  );
};
