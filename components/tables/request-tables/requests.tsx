"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Entreprise } from "@/constants/data";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "@/components/tables/request-tables/columns";
import { FC } from "react";

interface EntrepriseProps {
  data: Entreprise[];
}

export const EnterpriseRequests: FC<EntrepriseProps> = ({ data }) => {
  // const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Requests (${data.length})`}
          description="Validating the entreprise requests"
        />
      </div>
      <Separator />
      <DataTable searchKey="company_name" columns={columns} data={data} />
    </>
  );
};
