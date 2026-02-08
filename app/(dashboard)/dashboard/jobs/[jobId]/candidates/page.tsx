"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  ArrowLeft, 
  AlertCircle, 
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment";
import "moment/locale/fr";

interface Candidate {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville?: string;
  cv_path?: string;
  video_path?: string;
  status?: string;
  applied_at: string;
  experience_years?: number;
  skills?: string[];
}

interface JobData {
  id: number;
  titre: string;
  company_name: string;
}

export default function JobCandidatesPage() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { jobId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const breadcrumbItems = [
    { title: "Offres d'emploi", link: "/dashboard/jobs" },
    { title: "Détails", link: `/dashboard/jobs/${jobId}` },
    { title: "Candidatures", link: `/dashboard/jobs/${jobId}/candidates` },
  ];

  useEffect(() => {
    if (jobId) {
      const fetchData = async () => {
        try {
          setLoading(true);
          setError(null);
          const authToken = Cookies.get("authToken");

          // Récupérer les informations de l'offre
          const jobResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/offres_by_id/${jobId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (!jobResponse.ok) {
            throw new Error(`Erreur ${jobResponse.status}: ${jobResponse.statusText}`);
          }

          const jobData = await jobResponse.json();
          setJobData(jobData);

          // Récupérer les candidatures (simulé pour l'exemple)
          // En réalité, vous devriez avoir un endpoint pour récupérer les candidatures d'une offre
          const candidatesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/job/${jobId}/candidates`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (candidatesResponse.ok) {
            const candidatesData = await candidatesResponse.json();
            setCandidates(candidatesData.data || []);
          } else {
            // Si l'endpoint n'existe pas encore, on simule des données vides
            setCandidates([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
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

      fetchData();
    }
  }, [jobId, toast]);

  // Filtrer les candidats
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === "" || 
      `${candidate.prenom} ${candidate.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Accepté</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
    }
  };

  const getInitials = (prenom: string, nom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6 max-w-6xl mx-auto">
          <BreadCrumb items={breadcrumbItems} />
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    );
  }

  if (error || !jobData) {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-6 p-6 max-w-6xl mx-auto">
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

  const pendingCount = candidates.filter(c => !c.status || c.status === "pending").length;
  const acceptedCount = candidates.filter(c => c.status === "accepted").length;
  const rejectedCount = candidates.filter(c => c.status === "rejected").length;

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-6 p-6 max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <BreadCrumb items={breadcrumbItems} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{jobData.titre} • {jobData.company_name}</span>
            </div>
          </div>
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        {/* Titre */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              Candidatures reçues
            </CardTitle>
            <p className="text-muted-foreground">
              Gérez les candidatures pour l'offre "{jobData.titre}"
            </p>
          </CardHeader>
        </Card>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Candidatures à examiner
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
              <p className="text-xs text-muted-foreground">
                Candidats retenus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Candidats non retenus
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des candidats ({filteredCandidates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-white text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="accepted">Acceptés</option>
                  <option value="rejected">Rejetés</option>
                </select>
              </div>
            </div>

            {filteredCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {candidates.length === 0 ? "Aucune candidature" : "Aucun résultat"}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {candidates.length === 0 
                    ? "Cette offre n'a pas encore reçu de candidatures. Les nouvelles candidatures apparaîtront ici automatiquement."
                    : "Aucun candidat ne correspond aux critères de recherche sélectionnés."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={`/avatars/${candidate.id}.jpg`} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(candidate.prenom, candidate.nom)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {candidate.prenom} {candidate.nom}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {candidate.email}
                                </div>
                                {candidate.telephone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {candidate.telephone}
                                  </div>
                                )}
                                {candidate.ville && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {candidate.ville}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Candidature: {moment(candidate.applied_at).format("DD/MM/YYYY")}
                                </span>
                              </div>
                              {candidate.experience_years && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {candidate.experience_years} ans d'expérience
                                  </span>
                                </div>
                              )}
                            </div>

                            {candidate.skills && candidate.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {candidate.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{candidate.skills.length - 3} autres
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusBadge(candidate.status)}
                          
                          <div className="flex items-center gap-1 ml-4">
                            {candidate.cv_path && (
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                CV
                              </Button>
                            )}
                            {candidate.video_path && (
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Vidéo
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <User className="h-3 w-3 mr-1" />
                              Profil
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions en bas */}
        {candidates.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} affiché{filteredCandidates.length > 1 ? 's' : ''} sur {candidates.length} au total
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter la liste
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}