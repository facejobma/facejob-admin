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
import languagesData from "@/data/languages.json";
import skillsData from "@/data/skills.json";

// Import RichTextEditor and MultiSelect dynamically
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), { ssr: false });
const MultiSelect = dynamic(() => import("@/components/MultiSelect"), { ssr: false });

const BENEFIT_OPTIONS = ["Assurance santé", "Formation", "Télétravail", "Horaires flexibles", "Primes", "Transport", "Tickets restaurant", "Mutuelle"];

interface ReferenceSector {
  id: number;
  name: string;
  jobs?: Array<{ id: number; name: string }>;
}

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

const formatValidationErrors = (errors: unknown): string => {
  if (!errors || typeof errors !== "object") return "Les données envoyées sont invalides.";

  return Object.values(errors as Record<string, unknown>)
    .flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value): value is string => typeof value === "string")
    .join(" ") || "Les données envoyées sont invalides.";
};

interface JobFormData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string | null;
  company_name: string;
  sector_name: string;
  location: string;
  contractType: string;
  // Required IDs for validation
  sector_id: number | string;
  job_id: number | string | null;
  // Matching criteria fields (used in scoring)
  required_languages: string[];
  required_skills: string[];
  experience_required: number | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  benefits: string[];
}

export default function JobEditPage() {
  const [jobData, setJobData] = useState<JobFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<ReferenceSector[]>([]);
  const { jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  // Liste des langues disponibles depuis le fichier JSON local
  const availableLanguages = languagesData.languages;

  // Liste des compétences disponibles depuis le fichier JSON local
  const availableSkills = Array.from(new Set([
    ...(skillsData.technical_skills || []),
    ...(skillsData.soft_skills || []),
    ...(skillsData.business_skills || []),
    ...(skillsData.language_skills || []),
    ...(skillsData.industry_specific || []),
  ]));

  const breadcrumbItems = [
    { title: "Offres d'emploi", link: "/dashboard/jobs" },
    { title: "Détails", link: `/dashboard/jobs/${jobId}` },
    { title: "Modifier", link: `/dashboard/jobs/${jobId}/edit` },
  ];

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`, {
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(result?.message || `Erreur ${response.status}`);
        }

        setSectors(Array.isArray(result) ? result : (result?.data || []));
      } catch (error) {
        console.error("Error fetching sectors and jobs:", error);
        toast({
          title: "Référentiel indisponible",
          variant: "destructive",
          description: "Impossible de charger la liste des métiers. L'offre reste consultable.",
        });
      }
    };

    fetchSectors();
  }, [toast]);

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

          const result = await response.json();
          const data = result.data;
          // Normalize data to ensure proper types
          const normalizedData = {
            ...data,
            location: data.location || '',
            contractType: data.contractType || '',
            date_fin: data.date_fin || null,
            required_languages: normalizeStringArray(data.required_languages),
            required_skills: normalizeStringArray(data.required_skills),
            benefits: normalizeStringArray(data.benefits),
            experience_required: data.experience_required ?? null,
            salary_min: data.salary_min ?? null,
            salary_max: data.salary_max ?? null,
            currency: data.currency || 'MAD',
          };
          
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

  const handleInputChange = (field: keyof JobFormData, value: string | number | string[] | null) => {
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

  const selectedSector = sectors.find((sector) => String(sector.id) === String(jobData?.sector_id));

  const handleSave = async () => {
    if (!jobData) return;

    // Vérifier que les champs requis sont présents
    if (!jobData.sector_id || !jobData.titre.trim() || !jobData.location.trim() || !jobData.contractType || !jobData.date_debut) {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Renseignez le titre, la localisation, le contrat, le secteur et la date de début.",
      });
      return;
    }

    if (jobData.titre.trim().length < 5 || jobData.titre.trim().length > 200) {
      toast({ title: "Erreur", variant: "destructive", description: "Le titre doit contenir entre 5 et 200 caractères." });
      return;
    }

    if (jobData.location.trim().length < 2 || jobData.location.trim().length > 100) {
      toast({ title: "Erreur", variant: "destructive", description: "La localisation doit contenir entre 2 et 100 caractères." });
      return;
    }

    const descriptionText = jobData.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (descriptionText.length < 50 || descriptionText.length > 10000) {
      toast({ title: "Erreur", variant: "destructive", description: "La description doit contenir entre 50 et 10 000 caractères." });
      return;
    }

    if (jobData.date_fin && jobData.date_fin <= jobData.date_debut) {
      toast({ title: "Erreur", variant: "destructive", description: "La date de fin doit être postérieure à la date de début." });
      return;
    }

    if (jobData.salary_min !== null && jobData.salary_max !== null && jobData.salary_max < jobData.salary_min) {
      toast({ title: "Erreur", variant: "destructive", description: "Le salaire maximum doit être supérieur ou égal au salaire minimum." });
      return;
    }

    try {
      setSaving(true);
      const authToken = Cookies.get("authToken");

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
            job_id: jobData.job_id ? Number(jobData.job_id) : null,
            // Matching criteria (used in scoring algorithm)
            required_languages: jobData.required_languages || [],
            required_skills: jobData.required_skills || [],
            benefits: jobData.benefits || [],
            experience_required: jobData.experience_required,
            salary_min: jobData.salary_min,
            salary_max: jobData.salary_max,
            currency: jobData.currency,
          }),
        },
      );

      const responseData = await response.json().catch(() => ({}));

      if (response.ok) {
        toast({
          title: "Succès",
          description: responseData.message || "L'offre d'emploi a été mise à jour avec succès.",
        });
        router.push(`/dashboard/jobs/${jobId}`);
      } else {
        if (response.status === 422) {
          toast({
            title: "Erreur de validation",
            variant: "destructive",
            description: formatValidationErrors(responseData.errors),
          });
          return;
        } else {
          throw new Error(responseData.message || `Erreur ${response.status}: ${response.statusText}`);
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
                  maxLength={200}
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

              <div className="space-y-2">
                <Label htmlFor="job_id">Métier de référence (facultatif)</Label>
                <select
                  id="job_id"
                  value={jobData.job_id ?? ""}
                  onChange={(event) => handleInputChange("job_id", event.target.value ? Number(event.target.value) : null)}
                  disabled={sectors.length === 0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  <option value="">Autre métier / non répertorié</option>
                  {(selectedSector?.jobs || []).map((job) => (
                    <option key={job.id} value={job.id}>{job.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Ce champ améliore le matching, mais son absence ne bloque pas l'offre.
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
                    required
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience_required">Expérience requise (années)</Label>
                  <Input id="experience_required" type="number" min={0} max={50}
                    value={jobData.experience_required ?? ''}
                    onChange={(e) => handleInputChange('experience_required', e.target.value === '' ? null : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Salaire minimum</Label>
                  <Input id="salary_min" type="number" min={0} value={jobData.salary_min ?? ''}
                    onChange={(e) => handleInputChange('salary_min', e.target.value === '' ? null : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Salaire maximum</Label>
                  <Input id="salary_max" type="number" min={0} value={jobData.salary_max ?? ''}
                    onChange={(e) => handleInputChange('salary_max', e.target.value === '' ? null : Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <select id="currency" value={jobData.currency} onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="MAD">MAD</option><option value="EUR">EUR</option><option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avantages</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {BENEFIT_OPTIONS.map((benefit) => (
                    <label key={benefit} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                      <input type="checkbox" checked={jobData.benefits.includes(benefit)}
                        onChange={() => handleInputChange('benefits', jobData.benefits.includes(benefit)
                          ? jobData.benefits.filter((item) => item !== benefit)
                          : [...jobData.benefits, benefit])} />
                      {benefit}
                    </label>
                  ))}
                </div>
              </div>

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
                    list="skills-list"
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
                  <datalist id="skills-list">
                    {availableSkills.map((skill) => (
                      <option key={skill} value={skill} />
                    ))}
                  </datalist>
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
                  <li>• <strong>Métier de référence</strong> (20% lorsqu’il est renseigné) — sinon son poids est redistribué entre les autres critères</li>
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
                    min={jobData.date_debut ? moment(jobData.date_debut).format('YYYY-MM-DD') : undefined}
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
