"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { columns } from "./columns";
import { FC, useState } from "react";
import { CandidateDataTable } from "@/components/ui/candidate-table";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface ProductsClientProps {
  data: User[];
}

export const UserClient: FC<ProductsClientProps> = ({ data }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const csvContent = [
        ["Nom", "Email", "Téléphone", "Secteur", "Date de création"],
        ...data.map(user => [
          user.first_name || "",
          user.email || "",
          user.tel || "",
          typeof user.sector === 'object' ? user.sector?.name || "" : user.sector || "",
          new Date(user.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `candidats_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: "La liste des candidats a été exportée avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        variant: "destructive",
        description: "Une erreur est survenue lors de l'export.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Export..." : "Exporter CSV"}
        </Button>

      </div>
      
      <Separator />
      
      <div className="w-full max-w-full overflow-x-hidden">
        <CandidateDataTable searchKey="nomComplete" columns={columns} data={data} />
      </div>
    </div>
  );
};
