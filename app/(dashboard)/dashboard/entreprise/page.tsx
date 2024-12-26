"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { UserEnterprise } from "@/components/tables/user-tables/entreprises";
import { EnterpriseData } from "@/types";
import { Circles } from "react-loader-spinner";

const breadcrumbItems = [
  { title: "Entreprise", link: "/dashboard/entreprise" }
];

export default function UsersPage() {
  const [users, setUsers] = useState<EnterpriseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // New loading state
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        toast({
          title: "Authentication Error",
          variant: "destructive",
          description: "Token d'authentification manquant. Veuillez vous connecter."
        });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/entreprises`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data || []); // Ensure `data` is always an array
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
        console.error("Fetch error:", error); // Log the error for debugging
      } finally {
        setLoading(false); // Stop loading after the fetch is complete
      }
    };

    fetchData();
  }, [authToken, toast]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <UserEnterprise
          data={users.filter((entreprise) => entreprise.is_verified === "Accepted")}
          loading={loading} // Pass the loading state
        />
      </div>
    </>
  );
}
