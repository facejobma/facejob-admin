"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ProductForm } from "@/components/forms/product-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";

interface CandidateData {
  first_name: string;
  sector: string;
  email: string;
  tel: string;
  bio: string;
}

export default function Page() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(
    null,
  );
  const { userId } = useParams();

  console.log("userId, ", userId);

  const breadcrumbItems = [
    { title: "User", link: "/dashboard/user" },
    { title: "Create", link: "/dashboard/user/create" },
  ];

  useEffect(() => {
    if (userId) {
      // Fetch candidate data using userId
      const fetchCandidateData = async () => {
        try {
          const authToken = localStorage.getItem("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();

          // Assuming your API response contains properties like firstName, sector, email, tel
          const { first_name, sector, email, tel, bio } = data;

          // Set the candidate data in the state
          setCandidateData({ first_name, sector, email, tel, bio });
        } catch (error) {
          console.error("Error fetching candidate data:", error);
        }
      };

      // Fetch candidate data only if userId is available
      fetchCandidateData();
    }
  }, [userId]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {candidateData ? (
          <ProductForm
            categories={[
              { _id: "shirts", name: "shirts" },
              { _id: "pants", name: "pants" },
            ]}
            initialData={candidateData}
            key={userId as string} // Assuming userId is a string
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
