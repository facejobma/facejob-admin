import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertModal } from "@/components/modal/alert-modal";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  MessageSquare
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Job } from "@/types";
import { safeFetch, createSafeHeaders, sanitizeString } from "@/lib/security-utils";

interface CellActionProps {
  data: Job;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const router = useRouter();

  const onVerify = async (is_verified: string, commentText?: string) => {
    try {
      setLoading(true);

      // Sanitize the comment text
      const sanitizedComment = commentText ? sanitizeString(commentText) : sanitizeString(comment);

      // Essayer d'abord l'endpoint spécifique pour l'acceptation/refus
      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/job/accept/${data.id}`;
      
      // Si c'est un refus, essayer un endpoint spécifique pour le refus
      if (is_verified === "Declined") {
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/job/decline/${data.id}`;
      }

      const response = await safeFetch(endpoint, {
        method: "PUT",
        headers: createSafeHeaders(authToken || ''),
        body: {
          is_verified,
          comment: sanitizedComment,
        },
      });

      if (response.ok) {
        const actionText = is_verified === "Accepted" ? "acceptée et publiée" : "refusée";
        toast({
          title: "Succès !",
          description: `L'offre "${data.titre}" a été ${actionText}.`,
        });
        
        // Mise à jour locale des données
        data.is_verified = is_verified;
        
        // Fermer les dialogs
        setDeclineDialogOpen(false);
        setComment("");
        
        // Recharger pour actualiser les données
        window.location.reload();
      } else {
        // Check if it's a security error
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error_code === 'CLIENT_ERROR' && errorData.message?.includes('Suspicious activity')) {
            throw new Error('Accès temporairement restreint en raison d\'une activité suspecte détectée.');
          }
        }
        
        // Si l'endpoint spécifique n'existe pas, essayer l'endpoint générique
        const fallbackResponse = await safeFetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/job/update-status/${data.id}`,
          {
            method: "PUT",
            headers: createSafeHeaders(authToken || ''),
            body: {
              status: is_verified,
              comment: sanitizedComment,
            },
          },
        );

        if (fallbackResponse.ok) {
          const actionText = is_verified === "Accepted" ? "acceptée et publiée" : "refusée";
          toast({
            title: "Succès !",
            description: `L'offre "${data.titre}" a été ${actionText}.`,
          });
          
          data.is_verified = is_verified;
          setDeclineDialogOpen(false);
          setComment("");
          window.location.reload();
        } else {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour du statut.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      // Essayer d'abord l'endpoint spécifique pour la suppression
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/job/delete/${data.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      // Si l'endpoint spécifique n'existe pas, essayer l'endpoint générique
      if (!response.ok && response.status === 404) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres/${data.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
      }

      if (response.ok) {
        toast({
          title: "Succès",
          description: `L'offre "${data.titre}" a été supprimée avec succès.`,
        });
        window.location.reload();
      } else {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression.",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAccept = () => {
    onVerify("Accepted");
  };

  const handleDeclineConfirm = () => {
    const sanitizedComment = sanitizeString(comment);
    if (!sanitizedComment.trim()) {
      toast({
        title: "Commentaire requis",
        variant: "destructive",
        description: "Veuillez fournir un commentaire pour justifier le refus.",
      });
      return;
    }
    onVerify("Declined", sanitizedComment);
  };

  const copyJobLink = () => {
    const jobUrl = `${window.location.origin}/jobs/${data.id}`;
    navigator.clipboard.writeText(jobUrl);
    toast({
      title: "Lien copié",
      description: "Le lien de l'offre a été copié dans le presse-papiers.",
    });
  };

  const getStatusBadge = () => {
    const isVerified = data.is_verified;
    
    if (isVerified === true || isVerified === "Accepted") {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Publiée</Badge>;
    } else if (isVerified === false || isVerified === "Declined") {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Refusée</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>;
  };

  const isPending = data.is_verified === "Pending" || 
                   data.is_verified === false || 
                   (data.is_verified !== true && data.is_verified !== "Accepted");

  const isPublished = data.is_verified === true || data.is_verified === "Accepted";

  return (
    <>
      <AlertModal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            Actions
            {getStatusBadge()}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/jobs/${data.id}`)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Consulter les détails
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/jobs/${data.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier l'offre
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={copyJobLink}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copier le lien
          </DropdownMenuItem>

          {isPublished && (
            <DropdownMenuItem
              onClick={() => window.open(`/jobs/${data.id}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Voir sur le site
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/jobs/${data.id}/candidates`)}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Voir les candidatures
          </DropdownMenuItem>

          {isPending && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleAccept}
                disabled={loading}
                className="flex items-center gap-2 text-green-600 focus:text-green-600"
              >
                <CheckCircle className="h-4 w-4" />
                Accepter et publier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeclineDialogOpen(true)}
                disabled={loading}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <XCircle className="h-4 w-4" />
                Refuser l'offre
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600 flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de refus avec commentaire */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Refuser l'offre d'emploi
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de refuser l'offre <strong>"{data.titre}"</strong> de <strong>{data.company_name}</strong>. 
              Veuillez fournir un commentaire expliquant les raisons du refus.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Commentaire de refus *
              </label>
              <Textarea
                placeholder="Expliquez les raisons du refus (contenu inapproprié, informations manquantes, etc.)"
                value={comment}
                onChange={(e) => {
                  const sanitized = sanitizeString(e.target.value);
                  setComment(sanitized);
                }}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeclineDialogOpen(false);
                setComment("");
              }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeclineConfirm}
              disabled={loading || !comment.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Traitement..." : "Confirmer le refus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
