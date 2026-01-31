"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { EnterpriseRequests } from "@/components/tables/request-tables/requests";

import { EnterpriseData } from "@/types";

const breadcrumbItems = [{ title: "Requests", link: "/dashboard/requests" }];

export default function UsersPage() {
  const [entrepriseRequests, setEntrepriseRequests] = useState([] as EnterpriseData[]);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin/entreprises",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json"
            }
          }
        );
        const result = await response.json();
        
        // Extract the data array from the API response
        setEntrepriseRequests(result.data || []);
      } catch (error) {
        console.error("Requests fetch error:", error);
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données."
        });
      }
    };

    fetchData();
  }, [authToken, toast]);

  // Filter for pending requests
  const pendingRequests = entrepriseRequests.filter(
    (entreprise) => 
      entreprise?.is_verified === "Pending" || 
      entreprise?.is_verified === false ||
      !entreprise?.is_verified
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-full overflow-hidden">
      <BreadCrumb items={breadcrumbItems} />
      <EnterpriseRequests data={pendingRequests} />
    </div>
  );
}
