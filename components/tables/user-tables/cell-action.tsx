import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash, CheckCircle, XCircle, Clock, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User as UserType } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";

interface CellActionProps {
  data: UserType | any; // any pour supporter les propriétés étendues
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      setLoading(true);

      const authToken = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/candidate/delete/${data.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Candidat supprimé avec succès",
        });
        // Refresh the page to update the list
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Impossible de supprimer le candidat",
        });
      }
    } catch (error) {
      console.error("An error occurred while deleting the candidate:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Une erreur est survenue lors de la suppression",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const updateActivationStatus = async (activate: boolean) => {
    try {
      setLoading(true);
      const authToken = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/candidate/${data.id}/${activate ? 'activate' : 'deactivate'}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        toast({
          title: "Succès",
          description: `Candidat ${activate ? "activé" : "désactivé"} avec succès`,
        });
        window.location.reload();
      } else {
        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Impossible de mettre à jour le statut",
        });
      }
    } catch (error) {
      console.error("Error updating activation status:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Une erreur est survenue",
      });
    } finally {
      setLoading(false);
    }
  };

  const candidateName = data.first_name && data.last_name 
    ? `${data.first_name} ${data.last_name}`
    : data.nomComplete || 'Candidat';

  const isActive = data.email_verified_at;

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
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/candidate/${data.id}`)}
          >
            <Eye className="mr-2 h-4 w-4" /> Voir le profil
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/candidate/${data.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" /> Modifier
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => window.open(`mailto:${data.email}`, '_blank')}
          >
            <Mail className="mr-2 h-4 w-4" /> Envoyer un email
          </DropdownMenuItem>
          
          {data.tel && (
            <DropdownMenuItem
              onClick={() => window.open(`tel:${data.tel}`, '_blank')}
            >
              <Phone className="mr-2 h-4 w-4" /> Appeler
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          {!isActive && (
            <DropdownMenuItem
              onClick={() => updateActivationStatus(true)}
              disabled={loading}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Activer
            </DropdownMenuItem>
          )}
          
          {isActive && (
            <DropdownMenuItem
              onClick={() => updateActivationStatus(false)}
              disabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600" /> Désactiver
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};