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
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/entreprises",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();

        setEntrepriseRequests(data);
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
        <UserEnterprise
          data={entrepriseRequests
            .filter(
            (entreprise) => entreprise?.is_verified === "Accepted",
          )}
        />
      </div>
    </>
  );
}
