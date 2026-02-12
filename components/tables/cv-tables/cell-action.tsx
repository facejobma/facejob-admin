import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  XSquare,
  // Edit,
  MoreHorizontal,
  View,
} from "lucide-react";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CV } from "@/types";
import VideoPlayer from "@/components/VideoPlayer";

interface CellActionProps {
  data: CV;
  onRefresh?: () => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, onRefresh }) => {
  console.log("data,", data.link);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const [showPreview, setShowPreview] = useState(false);
  // const router = useRouter();

  const onDelete = async () => {
    try {
      setLoading(true);

      const authToken = localStorage.getItem("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/delete_cv/${data.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.ok) {
        console.log("Candidate deleted successfully!");
      } else {
        console.error("Failed to delete candidate");
      }
    } catch (error) {
      console.error("An error occurred while deleting the candidate:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onVerify = async (is_verified: string) => {
    try {
      if (is_verified === "Declined" && !comment) {
        toast({
          title: "Error!",
          variant: "destructive",
          description: "Please provide a comment.",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/verify/${data.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_verified,
            comment,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Success!",
          description: "CV a été éditée avec succès.",
        });
        
        // Refresh the data to show updated status
        if (onRefresh) {
          onRefresh();
        }
        
        // Clear comment after successful decline
        if (is_verified === "Declined") {
          setComment("");
        }
      } else {
        toast({
          title: "Error!",
          variant: "destructive",
          description: "Erreur lors de la mise à jour du CV.",
        });
      }
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error?.toString() || "Erreur lors de la récupération des données.",
      });
    }
  };

  const onPreview = () => {
    setShowPreview(true);
  };

  const onClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <>
      {/* <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      /> */}
      <Modal
        isOpen={showPreview}
        onClose={onClosePreview}
        title={"Aperçu du CV Vidéo"}
        description={
          "Visualisez le CV vidéo du candidat et validez ou refusez sa demande."
        }
        size="large"
      >
        <div className="space-y-6">
          {/* Video Player */}
          <div className="w-full">
            <VideoPlayer link={data.link} />
          </div>

          {/* Candidate Information */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Candidat
              </p>
              <p className="text-sm font-semibold">{data.candidat_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Secteur
              </p>
              <p className="text-sm font-semibold">{data.secteur_name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Statut
              </p>
              <span
                className={`inline-block rounded-full py-1 px-3 text-xs font-medium ${
                  data.is_verified === "Accepted"
                    ? "bg-green-200 text-green-800"
                    : data.is_verified === "Declined"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                }`}
              >
                {data.is_verified === "Accepted"
                  ? "Accepté"
                  : data.is_verified === "Declined"
                    ? "Décliné"
                    : "En attente"}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Date de création
              </p>
              <p className="text-sm font-semibold">
                {new Date(data.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => {
                onVerify("Accepted");
                onClosePreview();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={data.is_verified === "Accepted"}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Accepter
            </Button>
            <Button
              onClick={() => setOpen(true)}
              variant="destructive"
              className="flex-1"
              disabled={data.is_verified === "Declined"}
            >
              <XSquare className="mr-2 h-4 w-4" />
              Refuser
            </Button>
          </div>

          {/* Decline Comment Section */}
          {open && (
            <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <label className="text-sm font-medium">
                Commentaire de refus (obligatoire)
              </label>
              <Input
                placeholder="Entrez la raison du refus..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onVerify("Declined");
                    setOpen(false);
                    onClosePreview();
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  Confirmer le refus
                </Button>
                <Button
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
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
            onClick={() => {
              onVerify("Accepted");
            }}
          >
            <CheckSquare className="mr-2 h-4 w-4" /> Accept
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            <XSquare className="mr-2 h-4 w-4" /> Decline
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onPreview}>
            <View className="mr-2 h-4 w-4" /> Preview
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {open && (
        <div className="mt-4">
          <Input
            className="mb-2"
            placeholder="Enter comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            onClick={() => {
              onVerify("Declined" as string);
              setOpen(false);
            }}
          >
            Confirm Decline
          </Button>
        </div>
      )}
    </>
  );
};
