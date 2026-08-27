"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import BreadCrumb from "@/components/breadcrumb";
import { UserEnterprise } from "@/components/tables/user-tables/entreprises";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EnterpriseData } from "@/types";
import { Activity, AlertCircle, Building2, CheckCircle2, ChevronDown, ChevronUp, Clock3, LayoutDashboard, RefreshCw, Users, XCircle } from "lucide-react";

const breadcrumbItems = [{ title: "Entreprises", link: "/dashboard/entreprise" }];

export default function EntreprisePage() {
  const [enterprises, setEnterprises] = useState<EnterpriseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showStatistics, setShowStatistics] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError(null);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/entreprises`, {
        headers: { Authorization: `Bearer ${Cookies.get("authToken")}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Impossible de charger les entreprises.");
      const result = await response.json();
      setEnterprises(result.data || []);
      if (silent) toast({ title: "Liste actualisée", description: "Les données des entreprises sont à jour." });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Une erreur est survenue.";
      setError(message);
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    setShowStatistics(localStorage.getItem("enterprises:show-statistics") === "true");
    setShowActivity(localStorage.getItem("enterprises:show-activity") === "true");
    const refresh = () => fetchData(true);
    window.addEventListener("enterprises:refresh", refresh);
    return () => window.removeEventListener("enterprises:refresh", refresh);
  }, [fetchData]);

  const togglePanel = (panel: "statistics" | "activity") => {
    const setter = panel === "statistics" ? setShowStatistics : setShowActivity;
    const key = panel === "statistics" ? "enterprises:show-statistics" : "enterprises:show-activity";
    setter((current) => { localStorage.setItem(key, String(!current)); return !current; });
  };

  const accepted = useMemo(() => enterprises.filter((item) => item.is_verified === true || item.is_verified === "Accepted"), [enterprises]);
  const declined = useMemo(() => enterprises.filter((item) => item.is_verified === "Declined" || Boolean(item.comment)), [enterprises]);
  const pending = useMemo(() => enterprises.filter((item) => !accepted.includes(item) && !declined.includes(item)), [enterprises, accepted, declined]);
  const recent = useMemo(() => enterprises.filter((item) => Date.now() - new Date(item.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000), [enterprises]);
  const topSectors = useMemo(() => {
    const counts = enterprises.reduce<Record<string, number>>((result, item) => {
      const name = item.sector?.name || "Non renseigné";
      result[name] = (result[name] || 0) + 1;
      return result;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [enterprises]);

  const visibleData = activeTab === "active" ? accepted : activeTab === "pending" ? pending : activeTab === "declined" ? declined : enterprises;

  if (loading) return <div className="mx-auto max-w-[1600px] space-y-5 p-6"><Skeleton className="h-8 w-56" /><Skeleton className="h-24 w-full" /><Skeleton className="h-[460px] w-full" /></div>;

  if (error) return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-6"><BreadCrumb items={breadcrumbItems} /><Card><CardContent className="flex min-h-[320px] flex-col items-center justify-center text-center"><AlertCircle className="mb-3 h-10 w-10 text-red-500" /><h2 className="font-semibold">Chargement impossible</h2><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button className="mt-4" onClick={() => fetchData()}><RefreshCw className="mr-2 h-4 w-4" />Réessayer</Button></CardContent></Card></div>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 p-4 md:p-6">
      <BreadCrumb items={breadcrumbItems} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-semibold tracking-tight">Gestion des entreprises</h1><p className="mt-1 text-sm text-muted-foreground">Consultez et gérez tous les comptes entreprise depuis un espace unique.</p></div>
        <Button variant="outline" size="sm" onClick={() => fetchData(true)} disabled={refreshing}><RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Actualisation…" : "Actualiser"}</Button>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border bg-card p-2 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => togglePanel("statistics")} aria-expanded={showStatistics} className="gap-2"><LayoutDashboard className="h-4 w-4" />Statistiques{showStatistics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
        <Button variant="ghost" size="sm" onClick={() => togglePanel("activity")} aria-expanded={showActivity} className="gap-2"><Activity className="h-4 w-4" />Activité et répartition{showActivity ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
        {!showStatistics && !showActivity && <span className="self-center px-2 text-xs text-muted-foreground">Panneaux masqués pour libérer l’espace de travail</span>}
      </div>

      {showStatistics && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: enterprises.length, detail: "Comptes enregistrés", icon: Building2, color: "text-blue-600" },
          { label: "Actives", value: accepted.length, detail: "Accès autorisé", icon: CheckCircle2, color: "text-emerald-600" },
          { label: "En attente", value: pending.length, detail: "À examiner", icon: Clock3, color: "text-amber-600" },
          { label: "Refusées", value: declined.length, detail: "Accès non autorisé", icon: XCircle, color: "text-red-600" },
        ].map(({ label, value, detail, icon: Icon, color }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{label}</CardTitle><Icon className={`h-4 w-4 ${color}`} /></CardHeader><CardContent><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{detail}</p></CardContent></Card>)}
      </div>}

      {showActivity && <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4" />Activité récente</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Nouvelles entreprises sur 7 jours</span><strong>{recent.length}</strong></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Comptes traités</span><strong>{accepted.length + declined.length}</strong></div><div className="flex justify-between border-t pt-3 text-sm"><span className="text-muted-foreground">Taux de traitement</span><strong>{enterprises.length ? Math.round(((accepted.length + declined.length) / enterprises.length) * 100) : 0}%</strong></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4" />Principaux secteurs</CardTitle></CardHeader><CardContent className="space-y-3">{topSectors.length ? topSectors.map(([name, count]) => <div key={name} className="flex items-center justify-between text-sm"><span className="truncate text-muted-foreground">{name}</span><strong>{count}</strong></div>) : <p className="text-sm text-muted-foreground">Aucune donnée disponible.</p>}</CardContent></Card>
      </div>}

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4"><CardTitle className="text-lg">Répertoire des entreprises</CardTitle><p className="text-sm text-muted-foreground">Recherchez une entreprise puis utilisez le menu de sa ligne pour consulter ou modifier son compte.</p></CardHeader>
        <CardContent className="p-0"><Tabs value={activeTab} onValueChange={setActiveTab}><div className="overflow-x-auto px-6 pt-4"><TabsList className="inline-flex h-auto min-w-full justify-start gap-1 p-1 sm:min-w-0"><TabsTrigger value="all">Toutes ({enterprises.length})</TabsTrigger><TabsTrigger value="active">Actives ({accepted.length})</TabsTrigger><TabsTrigger value="pending">En attente ({pending.length})</TabsTrigger><TabsTrigger value="declined">Refusées ({declined.length})</TabsTrigger></TabsList></div><TabsContent value={activeTab} className="m-0 p-6"><UserEnterprise data={visibleData} onRefresh={() => fetchData(true)} isRefreshing={refreshing} /></TabsContent></Tabs></CardContent>
      </Card>
    </div>
  );
}
