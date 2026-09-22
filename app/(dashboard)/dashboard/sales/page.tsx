"use client";

import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { SalesTable } from "@/components/tables/sales-tables/sales";
import { useToast } from "@/components/ui/use-toast";
import { Sales } from "@/types";

export default function SalesPage() {
  const [sales, setSales] = useState<Sales[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/payments?per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      const salesData: Sales[] = result.data || [];
      const sortedSales = salesData.sort((a, b) => {
        return (
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      });

      setSales(sortedSales);
      setLastUpdated(new Date());
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de la récupération des données.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-7xl flex-1 space-y-6 p-6">
      <SalesTable
        data={sales}
        isLoading={isLoading}
        lastUpdated={lastUpdated}
        onRefresh={fetchData}
      />
    </div>
  );
}
