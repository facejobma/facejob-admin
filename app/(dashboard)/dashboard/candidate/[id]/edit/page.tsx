"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Edit3,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import BreadCrumb from "@/components/breadcrumb";
import { CandidateForm } from "@/components/forms/candidate-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User as UserType } from "@/types";

const collectApiErrors = (payload: any) => {
  if (!payload?.errors || typeof payload.errors !== "object") {
    return payload?.message || "Impossible de mettre à jour le candidat.";
  }
  const messages = Object.values(payload.errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string");
  return messages.join(" ") || payload?.message || "Données invalides.";
};

export default function EditCandidatePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const candidateId = params?.id;
  const authToken = Cookies.get("authToken");

  const [candidate, setCandidate] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems = useMemo(
    () => [
      { title: "Candidats", link: "/dashboard/candidate" },
      { title: "Détails", link: `/dashboard/candidate/${candidateId}` },
      { title: "Modifier", link: `/dashboard/candidate/${candidateId}/edit` },
    ],
    [candidateId],
  );

  const fetchCandidate = useCallback(
    async (signal?: AbortSignal) => {
      if (!authToken || !candidateId) {
        setError("Votre session administrateur est absente ou expirée.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/admin/candidate/${candidateId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            payload?.message ||
              (response.status === 404
                ? "Ce candidat n’existe pas ou a été supprimé."
                : "Impossible de charger ce candidat."),
          );
        }
        setCandidate((payload?.data || payload) as UserType);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        )
          return;
        setCandidate(null);
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Impossible de charger ce candidat.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [authToken, candidateId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void fetchCandidate(controller.signal);
    return () => controller.abort();
  }, [fetchCandidate]);

  const handleSave = async (formData: Record<string, unknown>) => {
    if (!authToken || !candidateId) {
      toast({
        title: "Session expirée",
        description: "Veuillez vous reconnecter avant d’enregistrer.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const { sector_id: _sectorId, ...values } = formData;
      const payloadToSend = {
        ...values,
        job_id: values.job_id ? Number(values.job_id) : null,
        years_of_experience:
          values.years_of_experience === ""
            ? null
            : Number(values.years_of_experience),
      };

      const response = await fetch(
        `/api/v1/admin/candidate/update/${candidateId}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadToSend),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(collectApiErrors(payload));

      toast({
        title: "Candidat mis à jour",
        description:
          payload?.message || "Les modifications ont été enregistrées.",
      });
      router.push(`/dashboard/candidate/${candidateId}`);
      router.refresh();
    } catch (caughtError) {
      toast({
        title: "Enregistrement impossible",
        description:
          caughtError instanceof Error
            ? caughtError.message
            : "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const candidateName =
    candidate?.first_name && candidate?.last_name
      ? `${candidate.first_name} ${candidate.last_name}`
      : candidate?.nomComplete || candidate?.email || "Candidat";

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">
              Chargement du formulaire…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
        <BreadCrumb items={breadcrumbItems} />
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <div className="rounded-2xl bg-red-50 p-4 text-red-600 dark:bg-red-950/40">
              <UserRound className="h-8 w-8" />
            </div>
            <h1 className="mt-5 text-xl font-bold">
              Modification indisponible
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error || "Ce candidat n’est plus accessible."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/candidate")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
              </Button>
              <Button
                onClick={() => void fetchCandidate()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BreadCrumb items={breadcrumbItems} />
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/candidate/${candidateId}`)}
          className="w-fit rounded-xl"
          disabled={saving}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la fiche
        </Button>
      </div>

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-700 p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
            <ShieldCheck className="h-3.5 w-3.5" /> Administration sécurisée
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
            <Edit3 className="h-7 w-7" /> Modifier le candidat
          </h1>
          <p className="mt-2 break-words text-sm leading-6 text-emerald-50 sm:text-base">
            Mettez à jour le profil de {candidateName}. Les informations de
            matching seront recalculées automatiquement lorsqu’un champ
            pertinent change.
          </p>
        </div>
      </section>

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <CardTitle className="text-base">Informations du profil</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <CandidateForm
            initialData={candidate}
            onSubmit={handleSave}
            onCancel={() => router.push(`/dashboard/candidate/${candidateId}`)}
            loading={saving}
          />
        </CardContent>
      </Card>
    </main>
  );
}
