"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
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
  FileText,
  Languages,
  Wrench,
  Info,
} from "lucide-react";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";

// Import RichTextEditor and MultiSelect dynamically
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });
const MultiSelect = dynamic(() => import("@/components/MultiSelect"), { ssr: false });

interface JobFormData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string;
  location: string;
  contractType: string;
  // Required IDs for validation
  sector_id: number | string;
  job_id: number | string;
  entreprise_id: number | string;
  // Matching criteria fields (used in scoring)
  required_languages: string[];
  required_skills: string[];
}

export default function JobEditPage() {
  const [jobData, setJobData] = useState<JobFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  // Liste étendue des langues disponibles
  const availableLanguages = [
    'Arabe', 'Français', 'Anglais', 'Espagnol', 'Allemand', 'Italien', 
    'Portugais', 'Russe', 'Chinois (Mandarin)', 'Japonais', 'Coréen', 
    'Turc', 'Néerlandais', 'Polonais', 'Suédois', 'Norvégien', 'Danois', 
    'Finnois', 'Grec', 'Hébreu', 'Hindi', 'Bengali', 'Ourdou', 'Persan', 
    'Thaï', 'Vietnamien', 'Indonésien', 'Malais', 'Tagalog', 'Swahili'
  ];

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
          
          // Normalize data to ensure proper types
          const normalizedData = {
            ...data,
            location: data.location || '',
            contractType: data.contractType || '',
            required_languages: Array.isArray(data.required_languages) 
              ? data.required_languages 
              : (data.required_languages ? JSON.parse(data.required_languages) : []),
            required_skills: Array.isArray(data.required_skills) 
              ? data.required_skills 
              : (data.required_skills ? JSON.parse(data.required_skills) : []),
          };
          
          console.log("Normalized data:", {
            required_languages: normalizedData.required_languages,
            required_skills: normalizedData.required_skills,
          });
          
          setJobData(normalizedData);
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

  const handleInputChange = (field: keyof JobFormData, value: string | number | string[]) => {
    if (jobData) {
      setJobData({
        ...jobData,
        [field]: value
      });
    }
  };

  // Fonction pour gérer les langues
  const handleLanguagesChange = (selectedLanguages: string[]) => {
    handleInputChange('required_languages', selectedLanguages);
  };

  // Fonction pour gérer les compétences - permettre les virgules dans le texte
  const handleSkillsInputChange = (value: string) => {
    // Ne pas split automatiquement, juste stocker la valeur
    handleInputChange('required_skills', [value]);
  };

  // Fonction pour ajouter une compétence
  const addSkill = (skillText: string) => {
    if (!skillText.trim()) return;
    
    const currentSkills = jobData?.required_skills || [];
    const newSkills = skillText.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const uniqueSkills = Array.from(new Set([...currentSkills, ...newSkills]));
    
    handleInputChange('required_skills', uniqueSkills);
  };

  // Fonction pour supprimer une compétence
  const removeSkill = (skillToRemove: string) => {
    const currentSkills = jobData?.required_skills || [];
    handleInputChange('required_skills', currentSkills.filter(s => s !== skillToRemove));
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
        titre_length: jobData.titre.length,
        description_length: jobData.description.length,
        date_debut: jobData.date_debut,
        date_fin: jobData.date_fin,
        location: jobData.location,
        contractType: jobData.contractType,
        sector_id: Number(jobData.sector_id),
        job_id: Number(jobData.job_id),
        entreprise_id: Number(jobData.entreprise_id),
        required_languages: jobData.required_languages || [],
        required_skills: jobData.required_skills || [],
      });

      // Use the correct admin endpoint
      const response = await fetch(
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
            // Matching criteria (used in scoring algorithm)
            required_languages: jobData.required_languages || [],
            required_skills: jobData.required_skills || [],
          }),
        },
      );

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
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { message: errorText };
          }
          console.error("Server error:", errorData);
          console.error("Response status:", response.status);
          console.error("Response headers:", Object.fromEntries(response.headers.entries()));
          
          toast({
            title: "Erreur serveur",
            variant: "destructive",
            description: errorData.message || `Erreur ${response.status}: ${response.statusText}`,
          });
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
                <RichTextEditor
                  content={jobData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Décrivez le poste, les missions, les compétences requises..."
                  minHeight="300px"
                />
                <p className="text-xs text-muted-foreground">
                  Utilisez la barre d'outils pour formater le texte (gras, listes, titres, liens, etc.)
                </p>
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
                  <Label htmlFor="location">Localisation *</Label>
                  <Input
                    id="location"
                    value={jobData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Casablanca, Maroc"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractType">Type de contrat</Label>
                  <select
                    id="contractType"
                    value={jobData.contractType || ''}
                    onChange={(e) => handleInputChange('contractType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Stage">Stage</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Alternance">Alternance</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critères de matching */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Critères de matching
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ces critères sont utilisés pour le score de matching candidat-offre
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Langues requises - MultiSelect */}
              <div className="space-y-2">
                <Label htmlFor="required_languages" className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Langues requises (Poids: 10%)
                </Label>
                <MultiSelect
                  options={availableLanguages}
                  value={jobData.required_languages || []}
                  onChange={handleLanguagesChange}
                  placeholder="Sélectionner les langues requises..."
                />
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>Cliquez pour ouvrir la liste et sélectionner plusieurs langues</span>
                </p>
              </div>

              {/* Compétences requises - Input avec bouton Ajouter */}
              <div className="space-y-2">
                <Label htmlFor="required_skills" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Compétences requises (Poids: 15%)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="required_skills"
                    placeholder="Ex: React.js, Python, SQL (séparez par des virgules)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        addSkill(input.value);
                        input.value = '';
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById('required_skills') as HTMLInputElement;
                      if (input) {
                        addSkill(input.value);
                        input.value = '';
                      }
                    }}
                    variant="outline"
                  >
                    Ajouter
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>Tapez les compétences séparées par des virgules, puis cliquez sur "Ajouter" ou appuyez sur Entrée</span>
                </p>
                {jobData.required_skills && Array.isArray(jobData.required_skills) && jobData.required_skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobData.required_skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-md border border-green-200">
                        <span className="text-sm">{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 text-green-600 hover:text-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info sur les autres critères */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Autres critères de matching automatiques
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Secteur</strong> (30%) - Défini par l'entreprise</li>
                  <li>• <strong>Titre du poste</strong> (20%) - Champ "Titre de l'offre"</li>
                  <li>• <strong>Expérience</strong> (20%) - Basé sur le profil candidat</li>
                  <li>• <strong>Localisation</strong> (3%) - Champ "Localisation"</li>
                  <li>• <strong>Type de contrat</strong> (2%) - Champ "Type de contrat"</li>
                </ul>
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