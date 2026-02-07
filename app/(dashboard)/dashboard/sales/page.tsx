"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { Sales } from "@/types";
import { SalesTable } from "@/components/tables/sales-tables/sales";

const breadcrumbItems = [{ title: "Les ventes", link: "/dashboard/sales" }];

export default function SalesPage() {
  const [sales, setSales] = useState([] as Sales[]);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin/payments",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();

        // Trier les ventes par date de création (du plus récent au plus ancien)
        const sortedSales = data.sort((a: Sales, b: Sales) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        setSales(sortedSales); // Mettre à jour l'état avec les ventes triées
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      }
    };

    fetchData();
  }, [authToken, toast]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <SalesTable data={sales} />
      </div>
    </>
  );
}