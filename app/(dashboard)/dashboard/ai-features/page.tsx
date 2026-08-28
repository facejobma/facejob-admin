"use client";
import { useEffect, useState, useCallback } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

const breadcrumbItems = [
  { title: "Fonctionnalités IA", link: "/dashboard/ai-features" },
];

type AiFeatureFlag = {
  key: string;
  enabled: boolean;
  updated_at: string | null;
};

const FEATURE_LABELS: Record<string, { title: string; description: string }> = {
  video_analysis: {
    title: "Analyse Vidéo IA",
    description:
      "Transcription, sous-titres, Smart Summary, analyse des soft skills et coaching (débit de parole). Désactiver arrête le lancement de nouvelles analyses ; l'upload vidéo reste fonctionnel.",
  },
  script_generation: {
    title: "Générateur de Script IA",
    description: "Génération de script de pitch à partir d'un CV (PDF ou texte).",
  },
  ai_matching: {
    title: "Matching IA Bidirectionnel",
    description:
      "Matching sémantique candidat ↔ offres. Désactiver bascule automatiquement sur le matching basé sur des règles (pas d'erreur visible côté utilisateur).",
  },
};

export default function AiFeaturesPage() {
  const [flags, setFlags] = useState<AiFeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const response = await fetch(`${backendUrl}/api/v1/admin/ai-features`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      setFlags(result.data || []);
    } catch (error) {
      console.error("Failed to fetch AI feature flags:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger l'état des fonctionnalités IA.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [authToken, toast]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggle = async (key: string, nextEnabled: boolean) => {
    setTogglingKey(key);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const response = await fetch(`${backendUrl}/api/v1/admin/ai-features/${key}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: nextEnabled }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setFlags((prev) =>
        prev.map((f) => (f.key === key ? { ...f, enabled: nextEnabled } : f))
      );
      toast({
        title: nextEnabled ? "Fonctionnalité activée" : "Fonctionnalité désactivée",
        description: FEATURE_LABELS[key]?.title || key,
      });
    } catch (error) {
      console.error(`Failed to toggle AI feature "${key}":`, error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le changement n'a pas pu être enregistré. Réessayez.",
      });
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Fonctionnalités IA</h2>
        <p className="text-muted-foreground">
          Activez ou désactivez indépendamment chaque service IA de la plateforme.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flags.map((flag) => {
            const label = FEATURE_LABELS[flag.key] || { title: flag.key, description: "" };
            return (
              <Card key={flag.key}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{label.title}</CardTitle>
                  </div>
                  {togglingKey === flag.key ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) => handleToggle(flag.key, checked)}
                    />
                  )}
                </CardHeader>
                <CardContent>
                  <CardDescription>{label.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
