"use client";
import { useEffect, useState, useCallback } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { CVRequests } from "@/components/tables/cv-tables/requests";

const breadcrumbItems = [
  { title: "Demandes", link: "/dashboard/candidate-videos" },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
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

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      // Extract the data array from the API response
      setUsers(result.data || []);
    } catch (error) {
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
  }, [authToken, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        />
      </div>
    </>
  );
}
