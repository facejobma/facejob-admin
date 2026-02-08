"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Users, 
  Edit,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";
import "moment/locale/fr";

interface JobData {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector_name: string;
  location?: string;
  contractType?: string;
  is_verified: string | boolean;
  created_at: string;
  updated_at?: string;
}

export default function JobDetailPage() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Offres d'emploi", link: "/dashboard/jobs" },
    { title: "Détails", link: `/dashboard/jobs/${jobId}` },
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

  const getStatusInfo = () => {
    if (!jobData) return { color: "gray", text: "Inconnu", icon: Clock };

    const isVerified = jobData.is_verified;
    
    if (isVerified === true || isVerified === "Accepted") {
      return { color: "green", text: "Publiée", icon: CheckCircle };
    } else if (isVerified === false || isVerified === "Declined") {
      return { color: "red", text: "Refusée", icon: XCircle };
    }
    return { color: "yellow", text: "En attente", icon: Clock };
  };

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
          <BreadCrumb items={breadcrumbItems} />
          
          {/* Skeleton pour l'en-tête */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Skeleton pour le contenu */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
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

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-6 max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <BreadCrumb items={breadcrumbItems} />
          <div className="flex items-center gap-2">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={() => router.push(`/dashboard/jobs/${jobId}/edit`)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        {/* Titre et statut */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  {jobData.titre}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {jobData.company_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {jobData.sector_name}
                  </div>
                  {jobData.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {jobData.location}
                    </div>
                  )}
                </div>
              </div>
              
              <Badge className={`
                ${statusInfo.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' : 
                  statusInfo.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' : 
                  'bg-yellow-100 text-yellow-800 border-yellow-200'}
              `}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.text}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Informations détaillées */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Description */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Description du poste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {jobData.description || "Aucune description disponible."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informations temporelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Période d'emploi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobData.date_debut && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date de début</p>
                    <p className="font-medium">{moment(jobData.date_debut).format("DD MMMM YYYY")}</p>
                  </div>
                </div>
              )}
              
              {jobData.date_fin && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Date de fin</p>
                    <p className="font-medium">{moment(jobData.date_fin).format("DD MMMM YYYY")}</p>
                  </div>
                </div>
              )}

              {jobData.contractType && (
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Type de contrat</p>
                    <Badge variant="outline">{jobData.contractType}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métadonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Informations système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="font-medium">
                    {moment(jobData.created_at).format("DD MMMM YYYY à HH:mm")}
                  </p>
                </div>
              </div>

              {jobData.updated_at && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Dernière modification</p>
                    <p className="font-medium">
                      {moment(jobData.updated_at).format("DD MMMM YYYY à HH:mm")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">ID de l'offre</p>
                  <p className="font-medium font-mono">#{jobData.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => router.push(`/dashboard/jobs/${jobId}/candidates`)}
                variant="outline"
              >
                <Users className="h-4 w-4 mr-2" />
                Voir les candidatures
              </Button>
              
              <Button 
                onClick={() => router.push(`/dashboard/jobs/${jobId}/edit`)}
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier l'offre
              </Button>

              {(jobData.is_verified === true || jobData.is_verified === "Accepted") && (
                <Button 
                  onClick={() => window.open(`/jobs/${jobId}`, '_blank')}
                  variant="outline"
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Voir sur le site
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
