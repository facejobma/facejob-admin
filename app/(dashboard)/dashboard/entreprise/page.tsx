"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { UserEnterprise } from "@/components/tables/user-tables/entreprises";

import { EnterpriseData } from "@/types";

const breadcrumbItems = [
  { title: "Entreprise", link: "/dashboard/entreprise" },
];

export default function UsersPage() {
  const [entrepriseRequests, setEntrepriseRequests] = useState(
    [] as EnterpriseData[],
  );
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
              "Content-Type": "application/json",
            },
          },
        );
        const result = await response.json();

        console.log("API Response:", result);
        console.log("Entreprises data:", result.data);
        
        // Extract the data array from the API response
        setEntrepriseRequests(result.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      }
    };

    fetchData();
  }, [authToken, toast]);

  // Debug: log the filtered data
  const filteredData = entrepriseRequests.filter(
    (entreprise) => entreprise?.is_verified === true || entreprise?.is_verified === "Accepted",
  );
  
  console.log("Total entreprises:", entrepriseRequests.length);
  console.log("Filtered entreprises:", filteredData.length);
  console.log("Sample entreprise:", entrepriseRequests[0]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-full overflow-hidden">
      <BreadCrumb items={breadcrumbItems} />
      <UserEnterprise data={filteredData} />
    </div>
  );
}
