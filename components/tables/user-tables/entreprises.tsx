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
  loading: boolean; // New prop for loading state
}

export const UserEnterprise: FC<ProductsClientProps> = ({ data, loading }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Enterprises (${data?.length || 0})`}
          description="Management des entreprises"
        />
      </div>
      <Separator />
      {loading ? ( // Show loader if loading
        <div className="flex justify-center items-center py-4">
          <Circles
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="circles-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
          />
        </div>
      ) : data && data.length > 0 ? (
        <EntrepriseDataTable
          searchKey="company_name"
          columns={columns}
          data={data}
        />
      ) : (
        <p>Aucune entreprise trouvée.</p>
      )}
    </>
  );
};
