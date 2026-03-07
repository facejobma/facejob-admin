"use client";
import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const JobPagination: FC<JobPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t bg-gradient-to-r from-slate-50 to-white">
      {/* Info */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border shadow-sm">
          <span className="font-medium text-slate-700">{startItem}</span>
          <span>-</span>
          <span className="font-medium text-slate-700">{endItem}</span>
          <span>sur</span>
          <span className="font-semibold text-blue-600">{totalItems}</span>
        </div>
      </div>

      {/* Contrôles */}
      <div className="flex items-center gap-6">
        {/* Taille de page */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Par page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[80px] bg-white shadow-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  12
                </div>
              </SelectItem>
              <SelectItem value="24">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  24
                </div>
              </SelectItem>
              <SelectItem value="36">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  36
                </div>
              </SelectItem>
              <SelectItem value="48">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                  48
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-lg px-3 py-1.5 border shadow-sm">
            <span className="text-sm text-muted-foreground">Page</span>
            <span className="text-sm font-semibold text-blue-600 min-w-[20px] text-center">{currentPage}</span>
            <span className="text-sm text-muted-foreground">sur</span>
            <span className="text-sm font-medium text-slate-700">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={!canGoPrevious}
              title="Première page"
              className="bg-white shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 h-8 w-8"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              title="Page précédente"
              className="bg-white shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNext}
              title="Page suivante"
              className="bg-white shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={!canGoNext}
              title="Dernière page"
              className="bg-white shadow-sm hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 h-8 w-8"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
