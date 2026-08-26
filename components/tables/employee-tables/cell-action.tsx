"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Edit, Eye, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { EnterpriseData } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const CellAction = ({ data }: { data: EnterpriseData }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const deleteEnterprise = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/enterprise/delete/${data.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${Cookies.get("authToken")}`, Accept: "application/json" },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "La suppression a échoué.");
      }
      toast({ title: "Entreprise supprimée", description: `Le compte ${data.company_name} a été supprimé.` });
      setDeleteOpen(false);
      window.dispatchEvent(new Event("enterprises:refresh"));
    } catch (error) {
      toast({ title: "Suppression impossible", description: error instanceof Error ? error.message : "Veuillez réessayer.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9" aria-label={`Actions pour ${data.company_name}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Gérer l’entreprise</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/entreprise/${data.id}`)}><Eye className="mr-2 h-4 w-4" />Consulter</DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/entreprise/${data.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Modifier</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-700 focus:text-red-700"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Supprimer cette entreprise ?</DialogTitle><DialogDescription>Le compte de {data.company_name} et son accès seront supprimés définitivement. Cette action est irréversible.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>Annuler</Button><Button variant="destructive" onClick={deleteEnterprise} disabled={deleting}>{deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Supprimer définitivement</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
