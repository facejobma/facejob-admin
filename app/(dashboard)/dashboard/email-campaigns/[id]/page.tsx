"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  RefreshCw,
} from "lucide-react";

type Recipient = {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  template_key: string | null;
  subject: string | null;
  error: string | null;
  sent_at: string | null;
  created_at: string;
};

type Campaign = {
  id: number;
  name: string;
  audience: string;
  template_key: string | null;
  subject: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  launched_at: string | null;
  completed_at: string | null;
  created_at: string;
  recipients: Recipient[];
};

const statusLabels: Record<string, string> = {
  pending: "En attente",
  sent: "Envoye",
  failed: "Echec",
  queued: "En attente",
  processing: "En cours",
  completed: "Terminee",
  completed_with_errors: "Terminee avec erreurs",
};

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  sent: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed_with_errors: "border-red-200 bg-red-50 text-red-700",
};

const templateLabels: Record<string, string> = {
  activation_account: "Relance activation du compte",
  incomplete_profile: "Relance profil incomplet",
  activation_profile: "Relance profil incomplet",
  video_cv: "Relance creation CV video",
  custom: "Message personnalise",
  automatic: "Automatique selon profil",
};

export default function EmailCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin";
  const campaignId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = useMemo(
    () => [
      { title: "Relances Email", link: "/dashboard/email-campaigns" },
      {
        title: campaign ? `Relance #${campaign.id}` : "Details",
        link: `/dashboard/email-campaigns/${campaignId}`,
      },
    ],
    [campaign, campaignId],
  );

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return;

    try {
      setIsLoading(true);
      const response = await fetch(apiBase + `/email-campaigns/${campaignId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Impossible de charger la relance.");
      }

      setCampaign(data);
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger la relance.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, authToken, campaignId, toast]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const templateLabel = (recipient: Recipient) => {
    if (recipient.template_key) {
      return templateLabels[recipient.template_key] || recipient.template_key;
    }

    if (campaign?.template_key === "automatic") {
      return "Automatique selon profil";
    }

    if (campaign?.template_key) {
      return templateLabels[campaign.template_key] || campaign.template_key;
    }

    return "-";
  };

  const resultSummary = useMemo(() => {
    if (!campaign) return { sent: 0, failed: 0, pending: 0 };

    return campaign.recipients.reduce(
      (acc, recipient) => {
        if (recipient.status === "sent") acc.sent += 1;
        if (recipient.status === "failed") acc.failed += 1;
        if (recipient.status === "pending") acc.pending += 1;
        return acc;
      },
      { sent: 0, failed: 0, pending: 0 },
    );
  }, [campaign]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-normal">
            Details de la relance
          </h1>
          <p className="text-sm text-muted-foreground">
            Emails notifies, statut d'envoi et template utilise.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/dashboard/email-campaigns")}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={fetchCampaign}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Cibles</span>
            <Mail className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {(campaign?.total_recipients || 0).toLocaleString("fr-FR")}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Envoyes</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700">
            {resultSummary.sent.toLocaleString("fr-FR")}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Echecs</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-700">
            {resultSummary.failed.toLocaleString("fr-FR")}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>En attente</span>
            <Clock3 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {resultSummary.pending.toLocaleString("fr-FR")}
          </div>
        </div>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle>{campaign?.name || "Relance"}</CardTitle>
          <CardDescription>
            {campaign?.subject || "Liste des emails de cette relance."}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="w-full min-w-0 overflow-x-auto rounded-md border">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Candidat</TableHead>
                  <TableHead className="w-[240px]">Email</TableHead>
                  <TableHead className="w-[190px]">Template envoye</TableHead>
                  <TableHead className="w-[240px]">Objet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[130px]">Date</TableHead>
                  <TableHead className="w-[220px]">Erreur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign?.recipients.map((recipient) => (
                  <TableRow key={recipient.id}>
                    <TableCell className="font-medium">
                      {[recipient.first_name, recipient.last_name]
                        .filter(Boolean)
                        .join(" ") || "-"}
                    </TableCell>
                    <TableCell>{recipient.email}</TableCell>
                    <TableCell>
                      <div
                        className="truncate"
                        title={templateLabel(recipient)}
                      >
                        {templateLabel(recipient)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className="truncate"
                        title={recipient.subject || campaign?.subject || "-"}
                      >
                        {recipient.subject || campaign?.subject || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[recipient.status] || ""}
                      >
                        {statusLabels[recipient.status] || recipient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(recipient.sent_at)}</TableCell>
                    <TableCell>
                      {recipient.error ? (
                        <div
                          className="truncate text-xs text-red-600"
                          title={recipient.error}
                        >
                          {recipient.error}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {!isLoading && (!campaign || campaign.recipients.length === 0) && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun destinataire trouve pour cette relance.
                    </TableCell>
                  </TableRow>
                )}

                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Chargement des details...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {campaign && campaign.total_recipients > campaign.recipients.length && (
            <div className="mt-3 text-sm text-muted-foreground">
              Affichage limite aux {campaign.recipients.length} premiers
              destinataires charges.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
