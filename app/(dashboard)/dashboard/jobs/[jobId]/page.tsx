"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { JobForm } from "@/components/forms/job-form";
import { Circles } from "react-loader-spinner";


interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: number;
  sector_name: number;
  is_verified: string;
}

export default function Page() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const { jobId } = useParams();

  const breadcrumbItems = [
    { title: "Job", link: "/dashboard/jobs" },
    { title: "Consult", link: `/dashboard/jobs/${jobId}` },
  ];

  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres_by_id/${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();

          const {
            id,
            titre,
            description,
            date_debut,
            date_fin,
            company_name,
            sector_name,
            is_verified,
          } = data;

          setJobData({
            id,
            titre,
            description,
            date_debut,
            date_fin,
            company_name,
            sector_name,
            is_verified,
          });
        } catch (error) {
          // console.log(error);
        }
      };

      fetchJobData();
    }
  }, [jobId]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {jobData ? (
          <JobForm initialData={jobData} key={jobId as string} />
        ) : (
          <div className="flex items-center justify-center h-[calc(100vh-220px)]">
            <Circles
              height={80}
              width={80}
              color="#4fa94d"
              ariaLabel="circles-loading"
              visible={true}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
