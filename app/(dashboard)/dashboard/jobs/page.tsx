"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
// import { UserClient } from "@/components/tables/user-tables/client";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { JobRequests } from "@/components/tables/job-tables/requests";

const breadcrumbItems = [{ title: "Jobs", link: "/dashboard/jobs" }];

export default function UsersPage() {
  const [jobs, setJobs] = useState([]);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    // console.log("token, ", authToken);

    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/offres",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      }
    };

    fetchData();
  }, [authToken]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <JobRequests data={jobs} />
      </div>
    </>
  );
}
