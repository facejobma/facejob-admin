import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EnterpriseData } from "@/types";
import Cookies from "js-cookie";

interface CellActionProps {
  data: EnterpriseData;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    try {
      setLoading(true);

      const authToken = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/enterprise/delete/${data.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.ok) {
        console.log("Enterprise deleted successfully!");
        // Refresh the page to update the list
        window.location.reload();
      } else {
        console.error("Failed to delete enterprise");
      }
    } catch (error) {
      console.error("An error occurred while deleting the enterprise:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/entreprise/${data.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" /> Visualiser
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/entreprise/${data.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Modifier
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
