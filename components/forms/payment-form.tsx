import Image from "next/image";
import { CheckCircle, XCircle } from "lucide-react";
import { Sales } from "@/types";
import React from "react";
import moment from "moment";

export const PaymentForm: React.FC<{ initialData: Sales }> = ({
                                                                initialData
                                                              }) => {
  const isPending = initialData.status === "pending";
  const isAccepted = initialData.status === "accepted";
  const isDeclined = initialData.status === "declined";

  // console.log("sector's name", initialData.entreprise);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto mt-8 p-6">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 relative rounded-full overflow-hidden">
          {initialData.entreprise?.logo && <Image
            src={initialData.entreprise?.logo}
            alt={`${initialData.entreprise?.company_name} Logo`}
            layout="fill"
            objectFit="cover"
          />}
        </div>
      </div>

      <p className="text-gray-600 text-center mt-4">
        {initialData.description}
      </p>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
          <p className="text-gray-600">{initialData.entreprise.email}</p>
          <p className="text-gray-600">{initialData.entreprise.phone}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Secteur</h2>
          <p className="text-gray-600">{initialData.entreprise.sector?.name}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Panel actuelle</h2>
          <p className="text-gray-600">{initialData.plan.name}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Prix</h2>
          <p className="text-gray-600">{initialData.price} DHs</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <p className="text-blue-500 hover:underline">
            {initialData.entreprise.site_web}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Company Size</h2>
          <p className="text-gray-600">{initialData.entreprise.effectif}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Date de transaction</h2>
          <p className="text-gray-600">
            {moment(initialData.created_at).format("DD/MM/YYYY")}
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        {isPending && (
          <>
            <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
              Accept
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
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
