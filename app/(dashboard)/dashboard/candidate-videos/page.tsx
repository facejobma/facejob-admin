"use client";
import { useEffect, useState, useCallback } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { CVRequests } from "@/components/tables/cv-tables/requests";
import { Button } from "@/components/ui/button";
import { CV } from "@/types";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const breadcrumbItems = [
  { title: "Demandes", link: "/dashboard/candidate-videos" },
];

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
};

export default function UsersPage() {
  const [users, setUsers] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    per_page: 12,
    total: 0,
    last_page: 1,
    from: null,
    to: null,
    has_more_pages: false,
  });
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      // Fetch all videos to allow filtering by status
      const url = new URL(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin/candidate-videos"
      );
      url.searchParams.set("page", currentPage.toString());
      url.searchParams.set("per_page", pageSize.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      // Extract the data array from the API response
      setUsers(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description: "Erreur lors de la récupération des données.",
      });
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [authToken, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const canGoPrevious = pagination.current_page > 1;
  const canGoNext = pagination.current_page < pagination.last_page;

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <CVRequests 
          data={users} 
          onRefresh={() => fetchData(true)} 
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          serverPagination
        />
        {pagination.total > 0 && (
          <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {pagination.from ?? 0}-{pagination.to ?? 0}
              </span>{" "}
              sur{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {pagination.total.toLocaleString()}
              </span>{" "}
              CV vidéo
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Par page
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  disabled={isRefreshing}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </label>

              <div className="flex items-center gap-2">
                <div className="min-w-[112px] text-center text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {pagination.current_page}
                  </span>{" "}
                  / {pagination.last_page || 1}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={!canGoPrevious || isRefreshing}
                  title="Première page"
                  className="h-9 w-9"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                  disabled={!canGoPrevious || isRefreshing}
                  title="Page précédente"
                  className="h-9 w-9"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((page) => Math.min(page + 1, pagination.last_page))}
                  disabled={!canGoNext || isRefreshing}
                  title="Page suivante"
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(pagination.last_page)}
                  disabled={!canGoNext || isRefreshing}
                  title="Dernière page"
                  className="h-9 w-9"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
