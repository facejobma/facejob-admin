"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Save,
  AlertCircle,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  FileText
} from "lucide-react";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

interface JobFormData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string;
  location?: string;
  contractType?: string;
  // Required IDs for validation - peuvent être des strings depuis l'API
  sector_id: number | string;
  job_id: number | string;
  entreprise_id: number | string;
}

export default function JobEditPage() {
  const [jobData, setJobData] = useState<JobFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Offres d'emploi", link: "/dashboard/jobs" },
    { title: "Détails", link: `/dashboard/jobs/${jobId}` },
    { title: "Modifier", link: `/dashboard/jobs/${jobId}/edit` },
  ];

  useEffect(() => {
    if (jobId) {
      const fetchJobData = async () => {
        try {
          setLoading(true);
          setError(null);
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres_by_id/${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log("Job data received:", data);
          console.log("Required IDs:", {
            sector_id: data.sector_id,
            job_id: data.job_id,
            entreprise_id: data.entreprise_id
          });
          setJobData(data);
        } catch (error) {
          console.error("Error fetching job data:", error);
          const errorMessage = error instanceof Error ? error.message : "Erreur lors de la récupération des données.";
          setError(errorMessage);
          toast({
            title: "Erreur",
            variant: "destructive",
            description: errorMessage,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchJobData();
    }
  }, [jobId, toast]);

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    if (jobData) {
      setJobData({
        ...jobData,
        [field]: value
      });
    }
  };

  const handleSave = async () => {
    if (!jobData) return;

    // Vérifier que les champs requis sont présents
    if (!jobData.sector_id || !jobData.job_id || !jobData.entreprise_id) {
      console.error("Missing required IDs:", {
        sector_id: jobData.sector_id,
        job_id: jobData.job_id,
        entreprise_id: jobData.entreprise_id
      });
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Données manquantes. Veuillez recharger la page.",
      });
      return;
    }

    try {
      setSaving(true);
      const authToken = Cookies.get("authToken");

      console.log("Sending job update with data:", {
        titre: jobData.titre,
        description: jobData.description,
        date_debut: jobData.date_debut,
        date_fin: jobData.date_fin,
        location: jobData.location,
        contractType: jobData.contractType,
        sector_id: jobData.sector_id,
        job_id: jobData.job_id,
        entreprise_id: jobData.entreprise_id,
      });

      // Essayer d'abord l'endpoint spécifique pour la mise à jour
      let response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/job/update/${jobId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titre: jobData.titre,
            description: jobData.description,
            date_debut: jobData.date_debut,
            date_fin: jobData.date_fin,
            location: jobData.location,
            contractType: jobData.contractType,
            // Include required IDs for validation - convertir en nombres
            sector_id: Number(jobData.sector_id),
            job_id: Number(jobData.job_id),
            entreprise_id: Number(jobData.entreprise_id),
          }),
        },
      );

      // Si l'endpoint spécifique n'existe pas, essayer l'endpoint générique
      if (!response.ok && response.status === 404) {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres/${jobId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              titre: jobData.titre,
              description: jobData.description,
              date_debut: jobData.date_debut,
              date_fin: jobData.date_fin,
              location: jobData.location,
              contractType: jobData.contractType,
              // Include required IDs for validation - convertir en nombres
              sector_id: Number(jobData.sector_id),
              job_id: Number(jobData.job_id),
              entreprise_id: Number(jobData.entreprise_id),
            }),
          },
        );
      }

      if (response.ok) {
        toast({
          title: "Succès",
          description: "L'offre d'emploi a été mise à jour avec succès.",
        });
        router.push(`/dashboard/jobs/${jobId}`);
      } else {
        // Gestion spécifique des erreurs de validation
        if (response.status === 422) {
          const errorData = await response.json();
          console.error("Validation errors:", errorData);
          toast({
            title: "Erreur de validation",
            variant: "destructive",
            description: `Erreurs de validation: ${JSON.stringify(errorData.errors)}`,
          });
        } else {
          const errorText = await response.text();
          console.error("Server error:", errorText);
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
          <BreadCrumb items={breadcrumbItems} />
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (error || !jobData) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
          <BreadCrumb items={breadcrumbItems} />
          <Card className="border-red-200">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Erreur de chargement</h3>
                  <p className="text-red-600">{error || "Offre d'emploi introuvable"}</p>
                </div>
                <Button onClick={() => router.back()} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center gap-2">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSave} size="sm" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </div>

        {/* Titre */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              Modifier l'offre d'emploi
            </CardTitle>
            <p className="text-muted-foreground">
              Modifiez les informations de l'offre d'emploi "{jobData.titre}"
            </p>
          </CardHeader>
        </Card>

        {/* Formulaire */}
        <div className="grid gap-6">
          {/* Informations principales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Informations principales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titre">Titre du poste *</Label>
                <Input
                  id="titre"
                  value={jobData.titre}
                  onChange={(e) => handleInputChange('titre', e.target.value)}
                  placeholder="Ex: Développeur Full Stack"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description du poste *</Label>
                <Textarea
                  id="description"
                  value={jobData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez le poste, les missions, les compétences requises..."
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations de l'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise</Label>
                <Input
                  id="company_name"
                  value={jobData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Le nom de l'entreprise ne peut pas être modifié depuis cette interface.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sector_name">Secteur d'activité</Label>
                <Input
                  id="sector_name"
                  value={jobData.sector_name}
                  onChange={(e) => handleInputChange('sector_name', e.target.value)}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  Le secteur d'activité est défini par l'entreprise.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Localisation et contrat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localisation et type de contrat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={jobData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Paris, France"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractType">Type de contrat</Label>
                  <Input
                    id="contractType"
                    value={jobData.contractType || ''}
                    onChange={(e) => handleInputChange('contractType', e.target.value)}
                    placeholder="Ex: CDI, CDD, Stage"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Période d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_debut">Date de début</Label>
                  <Input
                    id="date_debut"
                    type="date"
                    value={jobData.date_debut ? moment(jobData.date_debut).format('YYYY-MM-DD') : ''}
                    onChange={(e) => handleInputChange('date_debut', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_fin">Date de fin</Label>
                  <Input
                    id="date_fin"
                    type="date"
                    value={jobData.date_fin ? moment(jobData.date_fin).format('YYYY-MM-DD') : ''}
                    onChange={(e) => handleInputChange('date_fin', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions finales */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Les modifications seront sauvegardées et l'offre restera dans son état actuel.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => router.back()} variant="outline">
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}