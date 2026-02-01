"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import BreadCrumb from "@/components/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  User, 
  ArrowLeft, 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText
} from "lucide-react";
import Cookies from "js-cookie";
import { User as UserType } from "@/types";
import moment from "moment";
import "moment/locale/fr";

export default function CandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  
  const candidateId = params.id as string;
  const authToken = Cookies.get("authToken");

  const breadcrumbItems = [
    { title: "Candidats", link: "/dashboard/candidate" },
    { title: "Détails", link: `/dashboard/candidate/${candidateId}` }
  ];

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!authToken) {
        toast({
          title: "Erreur d'authentification",
          variant: "destructive",
          description: "Token d'authentification manquant. Veuillez vous reconnecter.",
        });
        router.push("/");
        return;
      }

      try {
        setLoading(true);
        
        const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/${candidateId}`;
        console.log("Fetching candidate from:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Candidat non trouvé");
          }
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Candidate data:", result);

        // Handle different response structures
        const candidateData = result.data || result;
        setCandidate(candidateData);
        
      } catch (error) {
        console.error("Error fetching candidate:", error);
        
        let errorMessage = "Erreur lors de la récupération du candidat.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          title: "Erreur",
          variant: "destructive",
          description: errorMessage,
        });
        
        // Redirect back to candidates list on error
        router.push("/dashboard/candidate");
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId, authToken, toast, router]);

  const handleBack = () => {
    router.push("/dashboard/candidate");
  };

  const handleEdit = () => {
    router.push(`/dashboard/candidate/${candidateId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <span className="text-muted-foreground">Chargement du candidat...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Candidat non trouvé</h3>
              <p className="text-muted-foreground">Le candidat demandé n'existe pas ou a été supprimé.</p>
            </div>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const candidateName = candidate.first_name && candidate.last_name 
    ? `${candidate.first_name} ${candidate.last_name}`
    : candidate.nomComplete || 'Nom non défini';

  const isActive = candidate.email_verified_at;
  const sectorName = typeof candidate.sector === 'object' ? candidate.sector?.name : candidate.sector;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex space-x-2">
          <Button onClick={handleEdit} size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold">{candidateName}</h1>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        Inactif
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {sectorName || 'Secteur non défini'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Inscrit le {moment(candidate.created_at).format("DD MMMM YYYY")}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Informations de contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                  </div>
                </div>
                
                {(candidate.tel || candidate.phone) && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Téléphone</p>
                      <p className="text-sm text-muted-foreground">{candidate.tel || candidate.phone}</p>
                    </div>
                  </div>
                )}

                {(candidate as any).ville && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ville</p>
                      <p className="text-sm text-muted-foreground">{(candidate as any).ville}</p>
                    </div>
                  </div>
                )}

                {(candidate as any).adresse && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Adresse</p>
                      <p className="text-sm text-muted-foreground">{(candidate as any).adresse}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Informations professionnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Secteur d'activité</p>
                    <p className="text-sm text-muted-foreground">
                      {sectorName || 'Non renseigné'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date d'inscription</p>
                    <p className="text-sm text-muted-foreground">
                      {moment(candidate.created_at).format("DD MMMM YYYY à HH:mm")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Statut du compte</p>
                    <p className="text-sm text-muted-foreground">
                      {isActive ? 'Compte vérifié et actif' : 'Compte non vérifié'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biography */}
        {candidate.bio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Biographie</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {candidate.bio}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}