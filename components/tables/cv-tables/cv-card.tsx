"use client";
import { FC, useState, useEffect } from "react";
import { CV, Sector } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CellAction } from "./cell-action";
import { Eye } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import VideoPlayer from "@/components/VideoPlayer";
import { CheckSquare, XSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import moment from "moment";
import "moment/locale/fr";

interface CVCardProps {
  data: CV[];
  onRefresh?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
}

export const CVCard: FC<CVCardProps> = ({ data, onRefresh, isLoading, isRefreshing }) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [selectValue, setSelectValue] = useState<string>("");
  const [sectorValue, setSectorValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize] = useState<number>(12);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        const sectorsData = Array.isArray(result) ? result : result.data || [];
        setSectors(sectorsData);
      })
      .catch((error) => {
        console.error("Error fetching secteur options:", error);
        setSectors([]);
      });
  }, []);

  const filteredData = data.filter((cv) => {
    const matchesSearch = cv.candidat_name
      ?.toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesStatus = !selectValue || cv.is_verified === selectValue;
    const matchesSector = !sectorValue || cv.secteur_name === sectorValue;
    return matchesSearch && matchesStatus && matchesSector;
  });

  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredData.length);
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(filteredData.length / pageSize) - 1)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-200 text-green-800";
      case "Declined":
        return "bg-yellow-200 text-yellow-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusTranslations: Record<string, string> = {
      Accepted: "Accepté",
      Declined: "Décliné",
      Pending: "En attente"
    };
    return statusTranslations[status] || status;
  };

  const onVerify = async (is_verified: string) => {
    if (!selectedCV) return;
    
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/verify/${selectedCV.id}`,
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
        
        if (onRefresh) {
          onRefresh();
        }
        
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Rechercher par candidat..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full sm:max-w-sm"
        />
        <select
          value={selectValue || ""}
          onChange={(e) => setSelectValue(e.target.value)}
          className="border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 min-w-[120px]"
        >
          <option value="">Tous les statuts</option>
          <option value="Pending">En cours</option>
          <option value="Accepted">Accepté</option>
          <option value="Declined">Décliné</option>
        </select>
        <select
          value={sectorValue || ""}
          onChange={(e) => setSectorValue(e.target.value)}
          className="border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 min-w-[120px]"
        >
          <option value="">Tous les secteurs</option>
          {Array.isArray(sectors) &&
            sectors.map((sector) => (
              <option key={sector.id} value={sector.name}>
                {sector.name}
              </option>
            ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative min-h-[400px]">
            {isRefreshing && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="text-sm font-medium">Actualisation...</span>
                </div>
              </div>
            )}
            {paginatedData.map((cv) => (
              <Card key={cv.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3 relative group">
                    <video
                      src={cv.link}
                      className="w-full h-full object-contain"
                      controls
                      preload="metadata"
                      playsInline
                      muted
                      onMouseEnter={(e) => {
                        e.currentTarget.muted = true;
                        e.currentTarget.play().catch(() => {});
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    >
                      <source src={cv.link} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                    <button
                      onClick={() => {
                        setSelectedCV(cv);
                        setShowPreview(true);
                      }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Voir en grand"
                    >
                      <Eye className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg truncate">
                      {cv.candidat_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {cv.secteur_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`${getStatusColor(cv.is_verified)} rounded-full py-1 px-3 text-xs font-medium`}
                      >
                        {getStatusLabel(cv.is_verified)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {moment(cv.created_at).format("DD/MM/YYYY")}
                      </span>
                    </div>
                    <div className="pt-2">
                      <CellAction data={cv} onRefresh={onRefresh} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucun CV vidéo trouvé
            </div>
          )}

          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              Affichage de {startIndex + 1} à {endIndex} sur{" "}
              {filteredData.length} CV vidéo(s)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={
                  currentPage === Math.ceil(filteredData.length / pageSize) - 1
                }
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {selectedCV && (
        <Modal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setOpen(false);
            setComment("");
          }}
          title={"Aperçu du CV Vidéo"}
          description={"Visualisez le CV vidéo du candidat et validez ou refusez sa demande."}
          size="large"
        >
          <div className="space-y-6">
            <div className="w-full">
              <VideoPlayer link={selectedCV.link} />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Candidat
                </p>
                <p className="text-sm font-semibold">{selectedCV.candidat_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Secteur
                </p>
                <p className="text-sm font-semibold">{selectedCV.secteur_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Statut
                </p>
                <span
                  className={`inline-block rounded-full py-1 px-3 text-xs font-medium ${getStatusColor(selectedCV.is_verified)}`}
                >
                  {getStatusLabel(selectedCV.is_verified)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Date de création
                </p>
                <p className="text-sm font-semibold">
                  {new Date(selectedCV.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => {
                  onVerify("Accepted");
                  setShowPreview(false);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={selectedCV.is_verified === "Accepted"}
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Accepter
              </Button>
              <Button
                onClick={() => setOpen(true)}
                variant="destructive"
                className="flex-1"
                disabled={selectedCV.is_verified === "Declined"}
              >
                <XSquare className="mr-2 h-4 w-4" />
                Refuser
              </Button>
            </div>

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
                      setShowPreview(false);
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
      )}
    </div>
  );
};
