import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash, Eye, Mail, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types";

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      setLoading(true);

      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/candidate/delete/${data.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: "Succès",
          variant: "default",
          description: "Le candidat a été supprimé avec succès."
        });
        // Recharger la page pour mettre à jour la liste
        window.location.reload();
      } else {
        throw new Error("Échec de la suppression");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du candidat:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Une erreur est survenue lors de la suppression."
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleContact = () => {
    if (data.email) {
      window.open(`mailto:${data.email}`, '_blank');
    }
  };

  const handleCall = () => {
    if (data.tel) {
      window.open(`tel:${data.tel}`, '_blank');
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        title="Supprimer le candidat"
        description="Êtes-vous sûr de vouloir supprimer ce candidat ? Cette action est irréversible."
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/candidate/${data.id}`)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Eye className="mr-2 h-4 w-4 text-blue-500" />
            <span>Voir le profil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/candidate/${data.id}/edit`)}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Edit className="mr-2 h-4 w-4 text-green-500" />
            <span>Modifier</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={handleContact}
            disabled={!data.email}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Mail className="mr-2 h-4 w-4 text-purple-500" />
            <span>Envoyer un email</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleCall}
            disabled={!data.tel}
            className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Phone className="mr-2 h-4 w-4 text-orange-500" />
            <span>Appeler</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setOpen(true)}
            className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <Trash className="mr-2 h-4 w-4" />
            <span>Supprimer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
