"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

interface EnterpriseData {
  company_name: string;
  secteur: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
}

export default function Page() {
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(
    null,
  );
  const { enterpriseId } = useParams();

  const breadcrumbItems = [
    { title: "Entreprise", link: "/dashboard/entreprise" },
    { title: "Create", link: "/dashboard/entreprise/create" },
  ];

  useEffect(() => {
    if (enterpriseId) {
      // Fetch enterprise data using enterpriseId
      const fetchEnterpriseData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${enterpriseId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();

          const {
            company_name,
            secteur,
            email,
            phone,
            adresse,
            site_web,
            effectif,
            description,
          } = data;

          setEnterpriseData({
            company_name,
            secteur,
            email,
            phone,
            adresse,
            site_web,
            effectif,
            description,
          });
        } catch (error) {
          // TODO: Handle this error
        }
      };

      fetchEnterpriseData();
    }
  }, [enterpriseId]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {enterpriseData ? (
          <ProductForm
            categories={[
              { _id: "shirts", name: "shirts" },
              { _id: "pants", name: "pants" },
            ]}
            initialData={enterpriseData}
            key={enterpriseId as string}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
