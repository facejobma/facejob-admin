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
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            
<AvatarImage
  src={sale.entreprise?.entreprise_logo || DEFAULT_LOGO}
  alt="Logo entreprise"
  onError={(e) => {
    const img = e.currentTarget;
    if (img.src.endsWith(DEFAULT_LOGO)) return;
    img.src = DEFAULT_LOGO;
  }}
/>
            <AvatarFallback>
              {sale.entreprise?.company_name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {sale.description}
            </p>
            <p className="text-sm text-muted-foreground">
              {moment(sale.created_at).fromNow()}
            </p>
          </div>

          <div className="ml-auto font-medium">
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
