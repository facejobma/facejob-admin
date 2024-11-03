import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

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

export const JobForm: React.FC<{ initialData: JobData }> = ({
  initialData,
}) => {
  const isPending = initialData.is_verified === "Pending";
  const isAccepted = initialData.is_verified === "Accepted";
  const isDeclined = initialData.is_verified === "Declined";

  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const router = useRouter();

  const onVerify = async (is_verified: string) => {
    try {
      if (is_verified === "Declined" && !comment) {
        toast({
          title: "Error!",
          variant: "destructive",
          description: "Please provide a comment.",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/job/accept/${initialData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_verified,
            comment,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Job a été vérifiée avec succès.",
        });
        initialData.is_verified = is_verified;
      } else {
        initialData.is_verified = "Pending";
      }
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error?.toString() || "Erreur lors de la récupération des données.",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto mt-8 p-6">
      <h1 className="text-lg font-semibold mb-2">{initialData.titre}</h1>
      <p className="text-gray-600 text-center mt-4">
        {initialData.description}
      </p>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Date de debut</h2>
          <p className="text-gray-600">{initialData.date_debut}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Date de fin</h2>
          <p className="text-gray-600">{initialData.date_fin}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Nom d entreprise</h2>
          <p className="text-blue-500 hover:underline">
            {initialData.company_name}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">sector</h2>
          <p className="text-gray-600">{initialData.sector_name}</p>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        {isPending && (
          <>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
              onClick={() => {
                onVerify("Accepted");
              }}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
              onClick={() => {
                onVerify("Accepted");
              }}
            >
              Decline
            </button>
          </>
        )}

        {isAccepted && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500 h-6 w-6" />
            <span className="text-green-500">Accepted</span>
          </div>
        )}

        {isDeclined && (
          <div className="flex items-center space-x-2">
            <XCircle className="text-red-500 h-6 w-6" />
            <span className="text-red-500">Declined</span>
          </div>
        )}
      </div>
    </div>
  );
};
