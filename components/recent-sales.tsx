import { Sale } from "@/types";
import moment from "moment";
import "moment/locale/fr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

moment.locale("fr");

const DEFAULT_LOGO = "/broken.png";

export function RecentSales({ sales }: { sales: Sale[] }) {
  return (
    <div className="space-y-8">
      {sales.map((sale, index) => (
        <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Avatar className="h-9 w-9 ring-2 ring-gray-100 dark:ring-gray-700">
            
<AvatarImage
  src={sale.entreprise?.entreprise_logo || DEFAULT_LOGO}
  alt="Logo entreprise"
  onError={(e) => {
    const img = e.currentTarget;
    if (img.src.endsWith(DEFAULT_LOGO)) return;
    img.src = DEFAULT_LOGO;
  }}
/>
            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {sale.entreprise?.company_name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">
              {sale.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {moment(sale.created_at).fromNow()}
            </p>
          </div>

          <div className="ml-auto font-medium text-green-600 dark:text-green-400">
            +MAD{" "}
            {parseFloat(sale.amount).toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
