"use client";

import { Separator } from "@/components/ui/separator";
import { columns } from "./columns";
import { FC } from "react";
import { CandidateDataTable } from "@/components/ui/candidate-table";
import { User } from "@/types";

interface ProductsClientProps {
  data: User[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchChange?: (value: string) => void;
}

export const UserClient: FC<ProductsClientProps> = ({
  data,
  onRefresh,
  isRefreshing,
  onSearchChange,
}) => {
  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
      <Separator />

      <div className="w-full max-w-full overflow-x-hidden">
        <CandidateDataTable
          searchKey="nomComplete"
          columns={columns}
          data={data}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onSearchChange={onSearchChange}
        />
      </div>
    </div>
  );
};
