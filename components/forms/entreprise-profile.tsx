import { Entreprise } from "@/constants/data";
import Image from "next/image";

interface EnterpriseData {
  logo: string;
  company_name: string;
  secteur: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
}

export const EntrepriseProfile: React.FC<{ initialData: EnterpriseData }> = ({
  initialData,
}) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg max-w-md mx-auto mt-8 p-6">
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 relative rounded-full overflow-hidden">
          <Image
            src={initialData.logo}
            alt={`${initialData.company_name} Logo`}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>

      <p className="text-gray-600 text-center mt-4">{initialData.description}</p>

      <div className="mt-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
          <p className="text-gray-600">{initialData.email}</p>
          <p className="text-gray-600">{initialData.phone}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Address</h2>
          <p className="text-gray-600">{initialData.adresse}</p>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Website</h2>
          <p className="text-blue-500 hover:underline">{initialData.site_web}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Company Size</h2>
          <p className="text-gray-600">{initialData.effectif}</p>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600">
          Accept
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">
          Decline
        </button>
      </div>
    </div>
  );
};
