"use client";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { columns } from "./columns";
import { FC } from "react";
import { CV } from "@/types";

interface CVProps {
  data: CV[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CVRequests: FC<CVProps> = ({ data, onRefresh, isLoading }) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Demandes (${data.length})`}
          description="Valider les CV Vidéos"
        />
      </div>
      <Separator />
      <DataTable 
        searchKey="candidat_name" 
        columns={columns} 
        data={data} 
        onRefresh={onRefresh}
        isLoading={isLoading}
      />
    </>
  );
};
