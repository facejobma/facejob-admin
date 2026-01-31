"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Camera,
  Save,
  Trash2,
  Edit3
} from "lucide-react";
import Cookies from "js-cookie";
import FileUpload from "@/components/file-upload";

interface CandidateData {
  id: string;
  first_name: string;
  last_name?: string;
  sector: string | { name: string };
  email: string;
  tel: string;
  bio: string;
  profile_picture?: string;
  created_at: string;
  email_verified_at?: string;
}

export default function Page() {
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [profileImage, setProfileImage] = useState<any[]>([]);
  const { userId } = useParams();
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Candidats", link: "/dashboard/candidate" },
    { title: "Profil", link: `/dashboard/candidate/${userId}` },
  ];

  useEffect(() => {
    if (userId) {
      fetchCandidateData();
    }
  }, [userId]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      const authToken = Cookies.get("authToken");

      if (!authToken) {
        toast({
          title: "Erreur d'authentification",
          variant: "destructive",
          description: "Token d'authentification manquant",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCandidateData(data);
      
      // Initialiser les données du formulaire
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        sector: typeof data.sector === 'object' ? data.sector?.name || "" : data.sector || "",
        email: data.email || "",
        tel: data.tel || "",
        bio: data.bio || "",
      });

      // Initialiser l'image de profil
      if (data.profile_picture) {
        setProfileImage([{
          fileUrl: data.profile_picture,
          url: data.profile_picture,
          key: `profile_${userId}`,
          fileName: "profile_picture",
          name: "profile_picture",
          fileSize: 0,
          size: 0,
          fileKey: `profile_${userId}`
        }]);
      }

    } catch (error) {
      console.error("Error fetching candidate data:", error);
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Erreur lors de la récupération des données du candidat.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const authToken = Cookies.get("authToken");

      const dataToSend = {
        ...formData,
        imgUrl: profileImage
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/updateId/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataToSend)
        }
      );

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès!",
        });
        setEditing(false);
        fetchCandidateData(); // Recharger les données
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        variant: "destructive",
        description: "Erreur lors de la sauvegarde du profil.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-6">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <span className="text-muted-foreground">Chargement du profil...</span>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  if (!candidateData) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-6">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <User className="h-12 w-12 text-gray-400 mx-auto" />
              <p className="text-muted-foreground">Candidat non trouvé.</p>
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  const sectorName = typeof candidateData.sector === 'object' 
    ? candidateData.sector?.name 
    : candidateData.sector;

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-6">
        <BreadCrumb items={breadcrumbItems} />
        
        {/* Header avec actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Profil du Candidat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez les informations du candidat
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    // Reset form data
                    setFormData({
                      first_name: candidateData.first_name || "",
                      last_name: candidateData.last_name || "",
                      sector: sectorName || "",
                      email: candidateData.email || "",
                      tel: candidateData.tel || "",
                      bio: candidateData.bio || "",
                    });
                  }}
                  disabled={saving}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 w-full max-w-full overflow-hidden">
          {/* Colonne de gauche - Photo et infos de base */}
          <div className="lg:col-span-1 space-y-6 w-full max-w-full">
            {/* Photo de profil */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Photo de profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <FileUpload
                    onChange={setProfileImage}
                    onRemove={setProfileImage}
                    value={profileImage}
                  />
                ) : (
                  <div className="flex justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage 
                        src={candidateData.profile_picture} 
                        alt={`${candidateData.first_name} ${candidateData.last_name || ''}`}
                      />
                      <AvatarFallback className="text-2xl">
                        {candidateData.first_name?.charAt(0)?.toUpperCase()}
                        {candidateData.last_name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations rapides */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Informations rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm">
                    {candidateData.email_verified_at ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Email vérifié
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Email non vérifié
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 break-words">
                    Inscrit le {new Date(candidateData.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {sectorName && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <Badge variant="outline" className="break-words max-w-full">{sectorName}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Colonne de droite - Détails du profil */}
          <div className="lg:col-span-2 space-y-6 w-full max-w-full min-w-0">
            {/* Informations personnelles */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="grid gap-4 sm:grid-cols-2 w-full">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="first_name">Prénom</Label>
                    {editing ? (
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Prénom"
                      />
                    ) : (
                      <p className="text-sm font-medium break-words">{candidateData.first_name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="last_name">Nom de famille</Label>
                    {editing ? (
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Nom de famille"
                      />
                    ) : (
                      <p className="text-sm font-medium break-words">{candidateData.last_name || "Non renseigné"}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2 w-full">
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    {editing ? (
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Adresse email"
                      />
                    ) : (
                      <p className="text-sm font-medium break-all">{candidateData.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 min-w-0">
                    <Label htmlFor="tel" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Téléphone
                    </Label>
                    {editing ? (
                      <Input
                        id="tel"
                        value={formData.tel}
                        onChange={(e) => handleInputChange('tel', e.target.value)}
                        placeholder="Numéro de téléphone"
                      />
                    ) : (
                      <p className="text-sm font-medium break-all">{candidateData.tel || "Non renseigné"}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 w-full min-w-0">
                  <Label htmlFor="sector" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Secteur d'activité
                  </Label>
                  {editing ? (
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      placeholder="Secteur d'activité"
                    />
                  ) : (
                    <p className="text-sm font-medium break-words">{sectorName || "Non renseigné"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Biographie */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Biographie
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                {editing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Décrivez le parcours et les compétences du candidat..."
                    rows={6}
                    className="resize-none w-full"
                  />
                ) : (
                  <div className="min-h-[120px] p-3 bg-gray-50 dark:bg-gray-800 rounded-md w-full overflow-hidden">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words overflow-wrap-anywhere">
                      {candidateData.bio || "Aucune biographie renseignée."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
