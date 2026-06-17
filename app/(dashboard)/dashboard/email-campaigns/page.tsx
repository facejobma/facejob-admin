"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

const breadcrumbItems = [
  { title: "Relances Email", link: "/dashboard/email-campaigns" },
];

type Option = {
  value: string;
  label: string;
  subject?: string;
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
  latest_error?: string | null;
  launched_at: string | null;
  completed_at: string | null;
  created_at: string;
};

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

const statusLabels: Record<string, string> = {
  queued: "En attente",
  processing: "En cours",
  completed: "Terminee",
  completed_with_errors: "Terminee avec erreurs",
  failed: "Echec",
};

const statusStyles: Record<string, string> = {
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed_with_errors: "border-red-200 bg-red-50 text-red-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

export default function EmailCampaignsPage() {
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin";

  const [audiences, setAudiences] = useState<Option[]>([]);
  const [templates, setTemplates] = useState<Option[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: null,
    to: null,
  });

  const summary = useMemo(
    () =>
      campaigns.reduce(
        (acc, campaign) => {
          acc.total += campaign.total_recipients;
          acc.sent += campaign.sent_count;
          acc.failed += campaign.failed_count;
          if (["queued", "processing"].includes(campaign.status)) {
            acc.pending += 1;
          }
          return acc;
        },
        { total: 0, sent: 0, failed: 0, pending: 0 },
      ),
    [campaigns],
  );

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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [optionsData, campaignsData] = await Promise.all([
        fetchJson("/email-campaigns/options"),
        fetchJson(`/email-campaigns?page=${currentPage}&per_page=10`),
      ]);

      setAudiences(optionsData.audiences || []);
      setTemplates(optionsData.templates || []);
      setCampaigns(campaignsData.data || []);
      setPagination({
        current_page: campaignsData.current_page || 1,
        last_page: campaignsData.last_page || 1,
        per_page: campaignsData.per_page || 10,
        total: campaignsData.total || 0,
        from: campaignsData.from || null,
        to: campaignsData.to || null,
      });
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des relances.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, fetchJson, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const retryFailed = async (campaignId: number) => {
    try {
      setIsLoading(true);
      const data = await fetchJson(`/email-campaigns/${campaignId}/retry-failed`, {
        method: "POST",
      });

      toast({
        title: "Relance programmee",
        description: data.message || "Les emails en echec seront relances.",
      });

      await loadData();
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de relancer les echecs.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const optionLabel = (options: Option[], value: string | null) =>
    options.find((option) => option.value === value)?.label ||
    (value === "automatic_weekly_candidates"
      ? "Relance automatique hebdomadaire"
      : value === "automatic"
        ? "Automatique"
        : value || "-");

  const campaignProgress = (campaign: Campaign) => {
    if (!campaign.total_recipients) return 0;
    return Math.min(
      100,
      Math.round(
        ((campaign.sent_count + campaign.failed_count) /
          campaign.total_recipients) *
          100,
      ),
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <BreadCrumb items={breadcrumbItems} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-normal">
            Relances Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Campagnes candidats, relances automatiques et messages individuels.
          </p>
        </div>
        <Button asChild className="gap-2 bg-[#60894B] hover:bg-[#50743f]">
          <Link href="/dashboard/email-campaigns/new">
            <Plus className="h-4 w-4" />
            Nouvelle relance
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total cibles</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {summary.total.toLocaleString("fr-FR")}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Envoyes</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700">
            {summary.sent.toLocaleString("fr-FR")}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Echecs</span>
            <AlertCircle className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-700">
            {summary.failed.toLocaleString("fr-FR")}
          </div>
        </div>
        <div className="rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>En cours</span>
            <Clock3 className="h-4 w-4" />
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {summary.pending.toLocaleString("fr-FR")}
          </div>
        </div>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Historique</CardTitle>
            <CardDescription>
              Campagnes manuelles et relances automatiques hebdomadaires.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualiser
          </Button>
        </CardHeader>
        <CardContent className="min-w-0">
          <div className="w-full min-w-0 overflow-x-auto rounded-md border">
            <Table className="min-w-[980px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Campagne</TableHead>
                  <TableHead className="w-[150px]">Cible</TableHead>
                  <TableHead className="w-[150px]">Template</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead className="text-right">Resultat</TableHead>
                  <TableHead className="w-[180px]">Erreur</TableHead>
                  <TableHead className="w-[130px]">Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="max-w-[260px] font-medium">
                      <div>{campaign.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {campaign.subject}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate" title={optionLabel(audiences, campaign.audience)}>
                        {optionLabel(audiences, campaign.audience)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px]">
                      <div className="truncate" title={optionLabel(templates, campaign.template_key)}>
                        {optionLabel(templates, campaign.template_key)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[campaign.status] || ""}
                      >
                        {statusLabels[campaign.status] || campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[160px]">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{campaignProgress(campaign)}%</span>
                        <span>{campaign.total_recipients} cible(s)</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#60894B]"
                          style={{ width: `${campaignProgress(campaign)}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      <div className="font-medium text-emerald-700">
                        {campaign.sent_count} envoyes
                      </div>
                      {campaign.failed_count > 0 && (
                        <div className="text-red-600">
                          {campaign.failed_count} echecs
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      {campaign.latest_error ? (
                        <div
                          className="truncate text-xs text-red-600"
                          title={campaign.latest_error}
                        >
                          {campaign.latest_error}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[130px]">
                      {formatDate(campaign.launched_at || campaign.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild type="button" variant="outline" size="icon">
                          <Link
                            href={`/dashboard/email-campaigns/${campaign.id}`}
                            aria-label="Voir les details de la relance"
                            title="Voir les details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {campaign.failed_count > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => retryFailed(campaign.id)}
                            disabled={isLoading}
                          >
                            Relancer
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {!isLoading && campaigns.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucune relance envoyee pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {pagination.total > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {pagination.from ?? 0}-{pagination.to ?? 0}
                </span>{" "}
                sur{" "}
                <span className="font-medium text-foreground">
                  {pagination.total.toLocaleString("fr-FR")}
                </span>{" "}
                campagnes
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={isLoading || pagination.current_page <= 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Precedent
                </Button>
                <div className="min-w-[92px] text-center text-sm text-muted-foreground">
                  Page {pagination.current_page} / {pagination.last_page || 1}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(pagination.last_page || 1, page + 1),
                    )
                  }
                  disabled={
                    isLoading ||
                    pagination.current_page >= (pagination.last_page || 1)
                  }
                  className="gap-2"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
