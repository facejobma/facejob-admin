"use client";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { FC } from "react";
import { CV } from "@/types";
import { LayoutGrid, List } from "lucide-react";
import { CVCard } from "./cv-card";

interface CVProps {
  data: CV[];
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
}

export const CVRequests: FC<CVProps> = ({ 
  data, 
  onRefresh, 
  isLoading,
  isRefreshing,
  viewMode = "table",
  onViewModeChange
}) => {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Demandes (${data.length})`}
          description="Valider les CV Vidéos"
        />
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange?.("table")}
          >
            <List className="h-4 w-4 mr-2" />
            Tableau
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange?.("cards")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cartes
          </Button>
        </div>
      </div>
      <Separator />
      
      {viewMode === "table" ? (
        <DataTable 
          searchKey="candidat_name" 
          columns={columns} 
          data={data} 
          onRefresh={onRefresh}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
        />
      ) : (
        <CVCard 
          data={data} 
          onRefresh={onRefresh}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
        />
      )}
    </>
  );
};
