"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import BreadCrumb from "@/components/breadcrumb";
import { CandidateForm } from "@/components/forms/candidate-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { User as UserType } from "@/types";

export default function EditCandidatePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const candidateId = params.id as string;
  const authToken = Cookies.get("authToken");

  const breadcrumbItems = [
    { title: "Candidats", link: "/dashboard/candidate" },
    { title: "Modifier", link: `/dashboard/candidate/${candidateId}/edit` }
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

  const handleSave = async (formData: any) => {
    if (!authToken) {
      toast({
        title: "Erreur d'authentification",
        variant: "destructive",
        description: "Token d'authentification manquant.",
      });
      return;
    }

    try {
      setSaving(true);
      
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/candidate/update/${candidateId}`;
      console.log("Updating candidate at:", apiUrl);
      console.log("Form data:", formData);

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Update response:", result);

      if (!response.ok) {
        throw new Error(result.message || `Erreur API: ${response.status}`);
      }

      toast({
        title: "Succès",
        description: "Le candidat a été mis à jour avec succès.",
      });

      // Redirect back to candidates list
      router.push("/dashboard/candidate");
      
    } catch (error) {
      console.error("Error updating candidate:", error);
      
      let errorMessage = "Erreur lors de la mise à jour du candidat.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Erreur",
        variant: "destructive",
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push("/dashboard/candidate");
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

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <BreadCrumb items={breadcrumbItems} />
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Modifier le candidat
          </h1>
          <p className="text-muted-foreground">
            Modifiez les informations du candidat {candidate.first_name && candidate.last_name 
              ? `${candidate.first_name} ${candidate.last_name}`
              : candidate.nomComplete || candidate.email}
          </p>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations du candidat</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CandidateForm 
              initialData={candidate}
              onSubmit={handleSave}
              loading={saving}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}