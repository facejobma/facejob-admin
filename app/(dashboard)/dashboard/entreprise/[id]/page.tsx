"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Users, 
  Edit,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Briefcase,
  FileText,
  Activity,
  DollarSign,
  Eye,
  Star,
  Award,
  Shield
} from "lucide-react";
import Image from "next/image";
import { EnterpriseData, Job, PaymentDetail } from "@/types";

export default function EntrepriseProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [entreprise, setEntreprise] = useState<EnterpriseData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<PaymentDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const authToken = Cookies.get("authToken");

  const breadcrumbItems = [
    { title: "Entreprises", link: "/dashboard/entreprise" },
    { title: "Profil", link: `/dashboard/entreprise/${params.id}` },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enterprise data
        const enterpriseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/entreprise/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (enterpriseResponse.ok) {
          const result = await enterpriseResponse.json();
          setEntreprise(result.data);
        }

        // Fetch jobs for this enterprise
        try {
          const jobsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/jobs?entreprise_id=${params.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (jobsResponse.ok) {
            const jobsResult = await jobsResponse.json();
            setJobs(jobsResult.data || []);
          }
        } catch (error) {
          console.error("Error fetching jobs:", error);
        }

        // Fetch payments for this enterprise
        try {
          const paymentsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/payments?entreprise_id=${params.id}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          if (paymentsResponse.ok) {
            const paymentsResult = await paymentsResponse.json();
            setPayments(paymentsResult.data || []);
          }
        } catch (error) {
          console.error("Error fetching payments:", error);
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

  const getStatusBadge = (isVerified: boolean | string) => {
    if (isVerified === true || isVerified === "Accepted") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Acceptée
        </Badge>
      );
    } else if (isVerified === false || isVerified === "Declined") {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" />
          Refusée
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </Badge>
      );
    }
  };

  const getJobStatusBadge = (isVerified: boolean | string) => {
    if (isVerified === true || isVerified === "Accepted") {
      return <Badge variant="default" className="bg-green-100 text-green-800">Actif</Badge>;
    } else if (isVerified === false || isVerified === "Declined") {
      return <Badge variant="destructive">Refusé</Badge>;
    } else {
      return <Badge variant="secondary">En attente</Badge>;
    }
  };

  const calculateStats = () => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.is_verified === true || job.is_verified === "Accepted").length;
    const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || "0"), 0);
    const lastPayment = payments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return {
      totalJobs,
      activeJobs,
      totalPayments,
      lastPayment
    };
  };

  const stats = entreprise ? calculateStats() : { totalJobs: 0, activeJobs: 0, totalPayments: 0, lastPayment: null };

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
          <h1 className="text-2xl font-bold">Profil de l'Entreprise</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/entreprise/${params.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            Voir les offres
          </Button>
        </div>
      </div>

      {/* Enterprise Header Card */}
      <Card className="border-l-4 border-l-blue-500 enterprise-card-hover">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 shadow-sm">
                {entreprise?.logo ? (
                  <Image
                    src={
                      entreprise.logo.startsWith("http") 
                        ? entreprise.logo
                        : entreprise.logo.startsWith("/")
                        ? entreprise.logo
                        : `/${entreprise.logo}`
                    }
                    alt={`${entreprise.company_name} Logo`}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      console.log("Enterprise logo load error for:", entreprise.logo);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{entreprise?.company_name}</h2>
                <p className="text-gray-600 text-lg">{entreprise?.sector?.name || "Secteur non défini"}</p>
                <div className="flex items-center space-x-4 mt-2">
                  {getStatusBadge(entreprise?.is_verified || false)}
                  <Badge variant="outline" className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {entreprise?.effectif} employés
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Membre depuis</p>
              <p className="font-semibold">
                {entreprise?.created_at ? new Date(entreprise.created_at).toLocaleDateString("fr-FR") : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offres d'emploi</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} actives
            </p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayments.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">
              Total des paiements
            </p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan actuel</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entreprise?.plan?.name || "Aucun"}</div>
            <p className="text-xs text-muted-foreground">
              Plan d'abonnement
            </p>
          </CardContent>
        </Card>
        
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dernier paiement</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.lastPayment ? `${parseFloat(stats.lastPayment.amount).toFixed(2)} €` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.lastPayment ? new Date(stats.lastPayment.created_at).toLocaleDateString("fr-FR") : "Aucun paiement"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="jobs">Offres d'emploi ({stats.totalJobs})</TabsTrigger>
          <TabsTrigger value="payments">Paiements ({payments.length})</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 tab-content-fade">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Informations de l'entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground break-words">
                    {entreprise?.description || "Aucune description disponible"}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm break-all">{entreprise?.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{entreprise?.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm break-words">{entreprise?.adresse}</span>
                  </div>
                  
                  {entreprise?.site_web && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={entreprise.site_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        {entreprise.site_web}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan & Additional Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Plan d'Abonnement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {entreprise?.plan?.name || "Aucun plan"}
                    </div>
                    {entreprise?.plan?.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {entreprise.plan.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(entreprise?.city || entreprise?.linkedin || entreprise?.founded_year) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Informations Complémentaires
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {entreprise?.city && (
                      <div>
                        <span className="text-sm font-medium">Ville:</span>
                        <p className="text-sm text-muted-foreground">{entreprise.city}</p>
                      </div>
                    )}
                    
                    {entreprise?.founded_year && (
                      <div>
                        <span className="text-sm font-medium">Année de création:</span>
                        <p className="text-sm text-muted-foreground">{entreprise.founded_year}</p>
                      </div>
                    )}
                    
                    {entreprise?.linkedin && (
                      <div>
                        <span className="text-sm font-medium">LinkedIn:</span>
                        <a 
                          href={entreprise.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline break-all block"
                        >
                          {entreprise.linkedin}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4 tab-content-fade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Offres d'emploi ({jobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="job-card rounded-lg p-4 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{job.titre}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {job.sector_name} • {job.location || "Localisation non spécifiée"}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-xs text-muted-foreground">
                              Publié le {new Date(job.created_at).toLocaleDateString("fr-FR")}
                            </span>
                            {job.date_fin && (
                              <span className="text-xs text-muted-foreground">
                                Expire le {new Date(job.date_fin).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          {getJobStatusBadge(job.is_verified)}
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Voir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune offre d'emploi trouvée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 tab-content-fade">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Historique des paiements ({payments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="payment-card rounded-lg p-4 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{parseFloat(payment.amount).toFixed(2)} €</h4>
                              <p className="text-sm text-muted-foreground">
                                {payment.plan?.name} • {payment.payment_method}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Période: {new Date(payment.start_date).toLocaleDateString("fr-FR")} - {new Date(payment.end_date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={payment.status === "completed" ? "default" : "secondary"}
                            className={payment.status === "completed" ? "bg-green-100 text-green-800" : ""}
                          >
                            {payment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(payment.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun paiement trouvé</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4 tab-content-fade">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Informations légales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {entreprise?.legal_form && (
                  <div>
                    <span className="text-sm font-medium">Forme juridique:</span>
                    <p className="text-sm text-muted-foreground">{entreprise.legal_form}</p>
                  </div>
                )}
                
                {entreprise?.ice_number && (
                  <div>
                    <span className="text-sm font-medium">Numéro ICE:</span>
                    <p className="text-sm text-muted-foreground">{entreprise.ice_number}</p>
                  </div>
                )}
                
                {entreprise?.rc_number && (
                  <div>
                    <span className="text-sm font-medium">Numéro RC:</span>
                    <p className="text-sm text-muted-foreground">{entreprise.rc_number}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium">Statut de vérification:</span>
                  <div className="mt-1">
                    {getStatusBadge(entreprise?.is_verified || false)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Inscription</span>
                      <p className="text-muted-foreground">
                        {entreprise?.created_at ? new Date(entreprise.created_at).toLocaleDateString("fr-FR") : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  {stats.lastPayment && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Dernier paiement</span>
                        <p className="text-muted-foreground">
                          {new Date(stats.lastPayment.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {jobs.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="text-sm">
                        <span className="font-medium">Dernière offre publiée</span>
                        <p className="text-muted-foreground">
                          {new Date(jobs[0].created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}