"use client";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { FC } from "react";
import { JobDataTable } from "@/components/ui/job-table";
import { columns } from "@/components/tables/job-tables/columns";
import { debugJobColumns } from "@/components/tables/job-tables/columns-debug";
import { Job } from "@/types";

interface JobProps {
  data: Job[];
}

export const JobRequests: FC<JobProps> = ({ data }) => {
  console.log("JobRequests - Received data:", data);
  console.log("JobRequests - Data length:", data.length);
  console.log("JobRequests - First job:", data[0]);
  
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Jobs (${data.length})`}
          description="Valider les Annonces"
        />
      </div>
      <Separator />
      <JobDataTable searchKey="titre" columns={debugJobColumns} data={data} />
    </>
  );
};
