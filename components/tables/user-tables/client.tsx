"use client";

import { columns } from "./columns";
import { FC } from "react";
import { CandidateDataTable } from "@/components/ui/candidate-table";
import { User } from "@/types";

interface ProductsClientProps {
  data: User[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchChange?: (value: string) => void;
  onSectorChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  sectorOptions?: string[];
}

export const UserClient: FC<ProductsClientProps> = ({
  data,
  onRefresh,
  isRefreshing,
  onSearchChange,
  onSectorChange,
  onStatusChange,
  sectorOptions,
}) => {
  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="w-full min-w-0">
        <CandidateDataTable
          searchKey="nomComplete"
          columns={columns}
          data={data}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onSearchChange={onSearchChange}
          onSectorChange={onSectorChange}
          onStatusChange={onStatusChange}
          sectorOptions={sectorOptions}
        />
      </div>
    </div>
  );
};
