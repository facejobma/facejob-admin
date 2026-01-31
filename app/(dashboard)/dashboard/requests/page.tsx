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

  // For debugging: show all enterprises first, then we can adjust the filter
  // const pendingRequests = entrepriseRequests; // Show all for now
  
  // Filter for pending requests (non-verified enterprises)
  const pendingRequests = entrepriseRequests.filter(
    (entreprise) => 
      entreprise?.is_verified === false || 
      entreprise?.is_verified === "Pending" ||
      entreprise?.is_verified === "Declined" ||
      (!entreprise?.is_verified && entreprise?.is_verified !== true)
  );

  console.log("All enterprises:", entrepriseRequests);
  console.log("Pending requests:", pendingRequests);
  console.log("Sample enterprise is_verified:", entrepriseRequests[0]?.is_verified);
  
  // If no pending requests, show all for debugging
  const displayData = pendingRequests.length > 0 ? pendingRequests : entrepriseRequests;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-full overflow-hidden">
      <BreadCrumb items={breadcrumbItems} />
      <EnterpriseRequests data={displayData} />
    </div>
  );
}
