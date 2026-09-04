"use client";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { AlertModal } from "@/components/modal/alert-modal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { columns } from "./columns";
import { FC, useState } from "react";
import { CV } from "@/types";
import {
  CheckSquare,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  Trash2,
  XSquare,
} from "lucide-react";
import { CVCard } from "./cv-card";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";

interface CVProps {
  data: CV[];
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
  title?: string;
  serverPagination?: boolean;
}

export const CVRequests: FC<CVProps> = ({
  data,
  onRefresh,
  isLoading,
  isRefreshing,
  viewMode = "table",
  onViewModeChange,
  title,
  serverPagination = false,
}) => {
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineComment, setDeclineComment] = useState("");
  const [pendingSelection, setPendingSelection] = useState<CV[]>([]);
  const [pendingResetSelection, setPendingResetSelection] = useState<
    (() => void) | null
  >(null);
  const { toast } = useToast();

  const runBulkStatus = async (
    selectedRows: CV[],
    resetSelection: () => void,
    status: "Pending" | "Accepted" | "Declined",
    comment?: string,
  ) => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description: "Token d'authentification manquant.",
      });
      return;
    }

    try {
      setBulkLoading(true);

      const response = await fetch(
        "/api/v1/admin/candidate-videos/bulk/status",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: selectedRows.map((cv) => cv.id),
            is_verified: status,
            comment,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Bulk status update failed");
      }

      toast({
        title: "Succès",
        description: `${selectedRows.length} CV vidéo mis à jour.`,
      });
      resetSelection();
      onRefresh?.();
    } catch {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Impossible de mettre à jour les CV vidéo sélectionnés.",
      });
    } finally {
      setBulkLoading(false);
      setDeclineOpen(false);
      setDeclineComment("");
      setPendingSelection([]);
      setPendingResetSelection(null);
    }
  };

  const runBulkDelete = async () => {
    const authToken = Cookies.get("authToken");

    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description: "Token d'authentification manquant.",
      });
      return;
    }

    try {
      setBulkLoading(true);

      const response = await fetch(
        "/api/v1/admin/candidate-videos/bulk/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: pendingSelection.map((cv) => cv.id),
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Bulk delete failed");
      }

      toast({
        title: "Succès",
        description: `${pendingSelection.length} CV vidéo supprimé(s).`,
      });
      pendingResetSelection?.();
      onRefresh?.();
    } catch {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Impossible de supprimer les CV vidéo sélectionnés.",
      });
    } finally {
      setBulkLoading(false);
      setDeleteOpen(false);
      setPendingSelection([]);
      setPendingResetSelection(null);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={runBulkDelete}
        loading={bulkLoading}
      />
      <Modal
        title="Refuser les CV vidéo"
        description="Ajoutez un commentaire optionnel pour les CV sélectionnés."
        isOpen={declineOpen}
        onClose={() => setDeclineOpen(false)}
      >
        <div className="space-y-4 pt-4">
          <Input
            placeholder="Commentaire de refus..."
            value={declineComment}
            onChange={(event) => setDeclineComment(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeclineOpen(false)}
              disabled={bulkLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={bulkLoading}
              onClick={() => {
                if (pendingResetSelection) {
                  runBulkStatus(
                    pendingSelection,
                    pendingResetSelection,
                    "Declined",
                    declineComment,
                  );
                }
              }}
            >
              Refuser
            </Button>
          </div>
        </div>
      </Modal>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            {title ?? `Demandes (${data.length})`}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Consultez et modérez les CV vidéo reçus.
          </p>
        </div>
        <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => onViewModeChange?.("table")}
          >
            <List className="h-4 w-4 mr-2" />
            Tableau
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            className="rounded-lg"
            onClick={() => onViewModeChange?.("cards")}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cartes
          </Button>
        </div>
      </div>
      {viewMode === "table" ? (
        <DataTable
          searchKey="candidat_name"
          columns={columns}
          data={data}
          onRefresh={onRefresh}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          disablePagination={serverPagination}
          renderBulkActions={(selectedRows, resetSelection) => (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-medium">
                {selectedRows.length} CV vidéo sélectionné(s)
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkLoading || isRefreshing}
                  onClick={() =>
                    runBulkStatus(selectedRows, resetSelection, "Accepted")
                  }
                >
                  {bulkLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                  )}
                  Accepter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkLoading || isRefreshing}
                  onClick={() =>
                    runBulkStatus(selectedRows, resetSelection, "Pending")
                  }
                >
                  <Clock className="mr-2 h-4 w-4" />
                  En attente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={bulkLoading || isRefreshing}
                  onClick={() => {
                    setPendingSelection(selectedRows);
                    setPendingResetSelection(() => resetSelection);
                    setDeclineOpen(true);
                  }}
                >
                  <XSquare className="mr-2 h-4 w-4 text-red-600" />
                  Refuser
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={bulkLoading || isRefreshing}
                  onClick={() => {
                    setPendingSelection(selectedRows);
                    setPendingResetSelection(() => resetSelection);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        />
      ) : (
        <CVCard
          data={data}
          onRefresh={onRefresh}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          disablePagination={serverPagination}
        />
      )}
    </>
  );
};
