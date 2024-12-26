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
  const [users, setUsers] = useState<EnterpriseData[]>([]);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        toast({
          title: "Authentication Error",
          variant: "destructive",
          description: "You are not authenticated. Please log in again.",
        });
        return;
      }

      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/entreprises",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Unexpected response format:", data);
          toast({
            title: "Data Error",
            variant: "destructive",
            description: "Received unexpected data from the server.",
          });
        }
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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <BreadCrumb items={breadcrumbItems} />
      <UserEnterprise
        data={(users || []).filter(
          (entreprise) => entreprise.is_verified === "Accepted",
        )}
      />
    </div>
  );
}
