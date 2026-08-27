"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Check, Eye, Loader2, MoreHorizontal, X } from "lucide-react";
import { EnterpriseData, EntrepriseStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const CellAction = ({ data }: { data: EnterpriseData }) => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<EntrepriseStatus | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const updateStatus = async (status: EntrepriseStatus) => {
    if (status === "Declined" && !comment.trim()) {
      toast({ title: "Motif requis", description: "Ajoutez un motif avant de refuser la demande.", variant: "destructive" });
      return;
    }

    setSubmitting(status);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/enterprise/accept/${data.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${Cookies.get("authToken")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_verified: status, comment: comment.trim() || null }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "La mise à jour a échoué.");
      }

      toast({
        title: status === "Accepted" ? "Entreprise activée" : "Demande refusée",
        description: status === "Accepted"
          ? "Le compte est actif et l’entreprise a été informée par e-mail."
          : "Le refus et son motif ont été enregistrés.",
      });
      setRejectOpen(false);
      setComment("");
      router.refresh();
      window.dispatchEvent(new Event("requests:refresh"));
    } catch (error) {
      toast({ title: "Mise à jour impossible", description: error instanceof Error ? error.message : "Veuillez réessayer.", variant: "destructive" });
    } finally {
      setSubmitting(null);
    }
  };

  const isAccepted = data.is_verified === true || data.is_verified === "Accepted";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={`Actions pour ${data.company_name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Gérer la demande</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/requests/${data.id}`)}>
            <Eye className="mr-2 h-4 w-4" /> Consulter le dossier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!isAccepted && (
            <DropdownMenuItem onClick={() => updateStatus("Accepted" as EntrepriseStatus)} disabled={submitting !== null} className="text-emerald-700 focus:text-emerald-700">
              {submitting === "Accepted" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              Valider et activer
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setRejectOpen(true)} disabled={submitting !== null} className="text-red-700 focus:text-red-700">
            <X className="mr-2 h-4 w-4" /> Refuser la demande
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
            <DialogDescription>
              Indiquez pourquoi la demande de {data.company_name} est refusée. Ce motif restera associé au dossier.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Motif du refus…" rows={4} autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={submitting !== null}>Annuler</Button>
            <Button variant="destructive" onClick={() => updateStatus("Declined" as EntrepriseStatus)} disabled={submitting !== null || !comment.trim()}>
              {submitting === "Declined" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
