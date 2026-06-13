"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { ArrowLeft, Loader2, Send, UserRound, Users } from "lucide-react";

const breadcrumbItems = [
  { title: "Relances Email", link: "/dashboard/email-campaigns" },
  { title: "Nouvelle relance", link: "/dashboard/email-campaigns/new" },
];

const recommendedTemplateByAudience: Record<string, string> = {
  inactive_candidates: "activation_account",
  incomplete_profiles: "incomplete_profile",
  no_video_cv: "video_cv",
  single_candidate: "custom",
};

type Option = {
  value: string;
  label: string;
  subject?: string;
};

export default function NewEmailCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin";

  const [audiences, setAudiences] = useState<Option[]>([]);
  const [templates, setTemplates] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [targetCount, setTargetCount] = useState<number | null>(null);

  const [name, setName] = useState("Relance candidats Facejob");
  const [audience, setAudience] = useState("incomplete_profiles");
  const [templateKey, setTemplateKey] = useState("incomplete_profile");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    "Bonjour {{Prenom}} {{Nom}},\n\nNous vous invitons a finaliser votre profil Facejob.\n\nLien: {{LienActivation}}\n\nL'equipe Facejob.ma",
  );

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.value === templateKey),
    [templateKey, templates],
  );

  const recommendedTemplate = recommendedTemplateByAudience[audience];
  const isSingleCandidate = audience === "single_candidate";

  const fetchJson = useCallback(
    async (path: string, init?: RequestInit) => {
      const response = await fetch(apiBase + path, {
        ...init,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Erreur API");
      }

      return data;
    },
    [apiBase, authToken],
  );

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setIsLoading(true);
        const data = await fetchJson("/email-campaigns/options");
        setAudiences(data.audiences || []);
        setTemplates(data.templates || []);
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description:
            error instanceof Error
              ? error.message
              : "Erreur lors du chargement des options.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOptions();
  }, [fetchJson, toast]);

  useEffect(() => {
    if (templateKey !== "custom") {
      setSubject(selectedTemplate?.subject || "");
    }
  }, [selectedTemplate, templateKey]);

  const optionLabel = (options: Option[], value: string | null) =>
    options.find((option) => option.value === value)?.label || value || "-";

  const previewAudience = async () => {
    try {
      setIsPreviewing(true);
      const data = await fetchJson("/email-campaigns/preview", {
        method: "POST",
        body: JSON.stringify({ audience, candidate_email: candidateEmail }),
      });
      setTargetCount(data.count);
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Impossible d'estimer la cible.",
      });
    } finally {
      setIsPreviewing(false);
    }
  };

  const launchCampaign = async () => {
    try {
      setIsSending(true);
      await fetchJson("/email-campaigns", {
        method: "POST",
        body: JSON.stringify({
          name,
          audience,
          candidate_email: candidateEmail,
          template_key: templateKey,
          subject,
          body,
        }),
      });

      toast({
        title: "Campagne programmee",
        description: "Les emails seront envoyes en arriere-plan par lots.",
      });

      router.push("/dashboard/email-campaigns");
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'envoi de la campagne.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-normal">
            Nouvelle relance
          </h1>
          <p className="text-sm text-muted-foreground">
            Preparer une campagne ou un email individuel.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/dashboard/email-campaigns")}
        >
          <ArrowLeft className="h-4 w-4" />
          Historique
        </Button>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Parametres de la relance</CardTitle>
            <CardDescription>
              Choisir une cible, un template ou un message personnalise.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Nom de la campagne</Label>
              <Input
                id="campaign-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Ciblage
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cible</Label>
                  <Select
                    value={audience}
                    onValueChange={(value) => {
                      setAudience(value);
                      setTemplateKey(
                        recommendedTemplateByAudience[value] || "custom",
                      );
                      setTargetCount(null);
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner une cible" />
                    </SelectTrigger>
                    <SelectContent>
                      {audiences.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select
                    value={templateKey}
                    onValueChange={setTemplateKey}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner un template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {recommendedTemplate && templateKey !== recommendedTemplate && (
                    <p className="text-xs text-amber-600">
                      Template recommande:{" "}
                      {optionLabel(templates, recommendedTemplate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {isSingleCandidate && (
              <div className="space-y-2">
                <Label htmlFor="candidate-email" className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Email du candidat
                </Label>
                <Input
                  id="candidate-email"
                  type="email"
                  placeholder="candidat@exemple.com"
                  value={candidateEmail}
                  onChange={(event) => {
                    setCandidateEmail(event.target.value);
                    setTargetCount(null);
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Objet</Label>
              <Input
                id="campaign-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                disabled={templateKey !== "custom"}
              />
            </div>

            {templateKey === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="campaign-body">Message personnalise</Label>
                <Textarea
                  id="campaign-body"
                  className="min-h-[220px]"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {"{{Prenom}}"}, {"{{Nom}}"}, {"{{Email}}"},{" "}
                  {"{{LienActivation}}"}, {"{{LienCvVideo}}"}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-[36px] text-sm">
                {targetCount !== null && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    Candidats cibles:{" "}
                    <span className="font-semibold">
                      {targetCount.toLocaleString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previewAudience}
                  disabled={
                    isPreviewing ||
                    isSending ||
                    (isSingleCandidate && !candidateEmail)
                  }
                  className="gap-2"
                >
                  {isPreviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  Estimer la cible
                </Button>
                <Button
                  type="button"
                  onClick={launchCampaign}
                  disabled={
                    isSending ||
                    !name ||
                    !audience ||
                    !templateKey ||
                    (isSingleCandidate && !candidateEmail)
                  }
                  className="gap-2 bg-[#60894B] hover:bg-[#50743f]"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Programmer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
