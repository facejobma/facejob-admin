"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { PaymentForm } from "@/components/forms/payment-form";
import { PaymentDetail } from "@/types";
// import { Sales } from "@/types";

// interface Sales {
//   price: number;
//   created_at: string;
//   description: string;
//   entreprise: EnterpriseData;
//   id: number;
//   plan: PlanDetails;
//   status: string;
//   updated_at: string;
// }

// interface EnterpriseData {
//   entreprise_logo: string;
//   company_name: string;
//   sector: Sector;
//   email: string;
//   phone: string;
//   adresse: string;
//   site_web: string;
//   effectif: string;
//   description: string;
//   is_verified: string;
//   plan_name: string;
// }

// interface PlanDetails {
//   id: number;
//   name: string;
//   description: string;
//   monthly_price: number;
//   quarterly_price: number;
//   annual_price: number;
//   account_creation_included: number;
//   cv_video_access: number;
//   cv_video_consultations: number;
//   job_postings: number;
//   dedicated_support: number;
//   created_at: string;
//   updated_at: string;
//   popular: boolean;
//   exclusive: boolean;
//   isMonthly: boolean;
//   isYearly: boolean;
//   isQuarterly: boolean;
// }

// export interface Sector {
//   id: number;
//   name: string;
//   created_at: string;
//   updated_at: string;
// }

export default function Page() {
  const [payments, setPayments] = useState<PaymentDetail | null>(null);
  const { saleId } = useParams();

  const breadcrumbItems = [
    { title: "Paiement", link: "/dashboard/sales" },
  ];

  useEffect(() => {
    if (saleId) {
      // Fetch enterprise data using saleId
      const fetchEnterpriseData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/payment/${saleId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();

          setPayments(data);
        } catch (error) {
          console.log(error);
        }
      };

      fetchEnterpriseData();
    }
  }, [saleId]);



  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {payments ? (
          <PaymentForm initialData={payments} key={saleId as string} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
