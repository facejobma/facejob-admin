"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { ArrowLeft, Save } from "lucide-react";
import { EnterpriseData, Sector, Plan } from "@/types";

export default function EditEntreprisePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [entreprise, setEntreprise] = useState<EnterpriseData | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const authToken = Cookies.get("authToken");

  const breadcrumbItems = [
    { title: "Entreprises", link: "/dashboard/entreprise" },
    { title: "Profil", link: `/dashboard/entreprise/${params.id}` },
    { title: "Modifier", link: `/dashboard/entreprise/${params.id}/edit` },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch entreprise data
        const entrepriseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/entreprise/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch sectors
        const sectorsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch plans
        const plansResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/plans`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (entrepriseResponse.ok) {
          const entrepriseResult = await entrepriseResponse.json();
          const enterpriseData = entrepriseResult.data;
          
          // Ensure numeric fields are properly typed
          setEntreprise({
            ...enterpriseData,
            effectif: typeof enterpriseData.effectif === 'string' 
              ? parseInt(enterpriseData.effectif) || 0 
              : enterpriseData.effectif || 0,
            founded_year: typeof enterpriseData.founded_year === 'string'
              ? parseInt(enterpriseData.founded_year) || null
              : enterpriseData.founded_year || null,
          });
        }

        if (sectorsResponse.ok) {
          const sectorsResult = await sectorsResponse.json();
          setSectors(Array.isArray(sectorsResult) ? sectorsResult : sectorsResult.data || []);
        }

        if (plansResponse.ok) {
          const plansResult = await plansResponse.json();
          setPlans(Array.isArray(plansResult) ? plansResult : plansResult.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Une erreur est survenue lors du chargement.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, authToken, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise) return;

    setSaving(true);
    try {
      const requestData = {
        company_name: entreprise.company_name,
        email: entreprise.email,
        phone: entreprise.phone,
        adresse: entreprise.adresse,
        site_web: entreprise.site_web,
        effectif: Number(entreprise.effectif) || 0, // Ensure it's a valid number, default to 0
        description: entreprise.description,
        sector_id: entreprise.sector?.id,
        is_verified: entreprise.is_verified,
        city: entreprise.city,
        linkedin: entreprise.linkedin,
        founded_year: entreprise.founded_year ? Number(entreprise.founded_year) : null,
        legal_form: entreprise.legal_form,
        ice_number: entreprise.ice_number,
        rc_number: entreprise.rc_number,
      };

      // Validate that effectif is a valid integer
      if (isNaN(requestData.effectif) || requestData.effectif < 0) {
        toast({
          title: "Erreur de validation",
          variant: "destructive",
          description: "L'effectif doit être un nombre entier positif.",
        });
        return;
      }

      console.log('Sending data:', requestData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/entreprise/update/${params.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Les informations de l'entreprise ont été mises à jour.",
        });
        router.push(`/dashboard/entreprise/${params.id}`);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erreur",
          variant: "destructive",
          description: errorData.message || "Erreur lors de la mise à jour.",
        });
      }
    } catch (error) {
      console.error("Error updating entreprise:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Une erreur est survenue lors de la mise à jour.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof EnterpriseData, value: any) => {
    if (!entreprise) return;
    
    // Handle numeric fields properly
    if (field === 'effectif' || field === 'founded_year') {
      const numValue = value === '' ? null : Number(value);
      setEntreprise({ ...entreprise, [field]: numValue });
    } else {
      setEntreprise({ ...entreprise, [field]: value });
    }
  };

  const handleSectorChange = (sectorId: string) => {
    const selectedSector = sectors.find(s => s.id.toString() === sectorId);
    if (selectedSector && entreprise) {
      setEntreprise({ ...entreprise, sector: selectedSector });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <p>Entreprise non trouvée</p>
          <Button onClick={() => router.back()} className="mt-4">
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-full overflow-x-hidden">
      <BreadCrumb items={breadcrumbItems} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Modifier l'Entreprise</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Nom de l'Entreprise *</Label>
                <Input
                  id="company_name"
                  value={entreprise.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={entreprise.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={entreprise.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="sector">Secteur</Label>
                <Select
                  value={entreprise.sector?.id?.toString() || ""}
                  onValueChange={handleSectorChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un secteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id.toString()}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="effectif">Effectif</Label>
                <Input
                  id="effectif"
                  type="number"
                  value={entreprise.effectif || ''}
                  onChange={(e) => handleInputChange("effectif", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="is_verified">Statut de Vérification</Label>
                <Select
                  value={entreprise.is_verified?.toString() || ""}
                  onValueChange={(value) => {
                    if (value === "true") handleInputChange("is_verified", true);
                    else if (value === "false") handleInputChange("is_verified", false);
                    else handleInputChange("is_verified", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Acceptée</SelectItem>
                    <SelectItem value="false">Refusée</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Localisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Textarea
                  id="adresse"
                  value={entreprise.adresse}
                  onChange={(e) => handleInputChange("adresse", e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={entreprise.city || ""}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="site_web">Site Web</Label>
                <Input
                  id="site_web"
                  type="url"
                  value={entreprise.site_web}
                  onChange={(e) => handleInputChange("site_web", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={entreprise.linkedin || ""}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="founded_year">Année de Création</Label>
                <Input
                  id="founded_year"
                  type="number"
                  value={entreprise.founded_year || ""}
                  onChange={(e) => handleInputChange("founded_year", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={entreprise.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              placeholder="Description de l'entreprise..."
            />
          </CardContent>
        </Card>

        {/* Legal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="legal_form">Forme Juridique</Label>
                <Input
                  id="legal_form"
                  value={entreprise.legal_form || ""}
                  onChange={(e) => handleInputChange("legal_form", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ice_number">Numéro ICE</Label>
                <Input
                  id="ice_number"
                  value={entreprise.ice_number || ""}
                  onChange={(e) => handleInputChange("ice_number", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="rc_number">Numéro RC</Label>
                <Input
                  id="rc_number"
                  value={entreprise.rc_number || ""}
                  onChange={(e) => handleInputChange("rc_number", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}