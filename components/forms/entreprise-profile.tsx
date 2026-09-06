import {
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Globe,
  Users,
  MapPin,
  Building2,
  Calendar,
  ExternalLink,
  Award,
  Clock,
} from "lucide-react";
import { EnterpriseData } from "@/types";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { SafeLogo } from "@/components/ui/safe-logo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const EntrepriseProfile: React.FC<{
  initialData: EnterpriseData;
  onStatusChange?: (status: "Accepted" | "Declined") => void;
}> = ({ initialData, onStatusChange }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(String(initialData.is_verified));
  const [rejectOpen, setRejectOpen] = useState(false);
  const [comment, setComment] = useState(initialData.comment || "");
  const isPending = status === "Pending";
  const isAccepted = status === "Accepted";
  const isDeclined = status === "Declined";

  const handleStatusChange = async (action: "accept" | "decline") => {
    const nextStatus = action === "accept" ? "Accepted" : "Declined";
    if (nextStatus === "Declined" && !comment.trim()) {
      toast({ title: "Motif requis", description: "Ajoutez un motif avant de refuser la demande.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/enterprise/accept/${initialData.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_verified: nextStatus,
            comment: nextStatus === "Declined" ? comment.trim() : null,
          }),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "La mise à jour a échoué.");

      setStatus(nextStatus);
      setRejectOpen(false);
      onStatusChange?.(nextStatus);
      window.dispatchEvent(new Event("requests:refresh"));
      toast({
        title:
          action === "accept" ? "Entreprise acceptée" : "Entreprise refusée",
        description: `Le statut de ${initialData.company_name} a été mis à jour.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = () => {
    if (isAccepted) return "text-green-600 bg-green-50 border-green-200";
    if (isDeclined) return "text-red-600 bg-red-50 border-red-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const getStatusIcon = () => {
    if (isAccepted) return <CheckCircle className="h-5 w-5" />;
    if (isDeclined) return <XCircle className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-6">
      {/* En-tête avec logo et informations principales */}
      <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Logo et nom */}
            <div className="flex flex-col items-center space-y-4 md:items-start">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border bg-slate-50 dark:bg-slate-900">
                <SafeLogo
                  src={initialData.logo}
                  alt={`${initialData.company_name} Logo`}
                  className="h-full w-full object-contain p-2"
                  fallbackClassName="h-10 w-10 text-slate-400"
                />
              </div>

              <div className="text-center md:text-left">
                <h2 className="break-words text-2xl font-bold text-slate-950 dark:text-white">
                  {initialData.company_name}
                </h2>
                {initialData.sector && (
                  <Badge variant="outline" className="mt-2">
                    <Building2 className="h-3 w-3 mr-1" />
                    {typeof initialData.sector === "object"
                      ? initialData.sector.name
                      : initialData.sector}
                  </Badge>
                )}
              </div>
            </div>

            {/* Statut et actions */}
            <div className="flex flex-1 flex-col justify-between gap-4">
              <div className="flex justify-center md:justify-end">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}
                >
                  {getStatusIcon()}
                  <span className="font-medium">
                    {isAccepted
                      ? "Acceptée"
                      : isPending
                        ? "En attente"
                        : "Refusée"}
                  </span>
                </div>
              </div>

              {isPending && (
                <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-end">
                  <Button
                    onClick={() => setRejectOpen(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("accept")}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepter
                  </Button>
                </div>
              )}
            </div>
          </div>

          {initialData.description && (
            <div className="mt-6">
              <p className="text-gray-600 leading-relaxed">
                {initialData.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Informations de contact */}
        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Informations de contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{initialData.email}</p>
              </div>
            </div>

            {initialData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{initialData.phone}</p>
                </div>
              </div>
            )}

            {initialData.adresse && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">{initialData.adresse}</p>
                </div>
              </div>
            )}

            {initialData.site_web && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Site web</p>
                  <a
                    href={initialData.site_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    {initialData.site_web}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations sur l'entreprise */}
        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Détails de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialData.effectif && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Effectif</p>
                  <p className="font-medium">{initialData.effectif} employés</p>
                </div>
              </div>
            )}

            {initialData.founded_year && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Année de création</p>
                  <p className="font-medium">{initialData.founded_year}</p>
                </div>
              </div>
            )}

            {initialData.legal_form && (
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Forme juridique</p>
                  <p className="font-medium">{initialData.legal_form}</p>
                </div>
              </div>
            )}

            {initialData.created_at && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date d'inscription</p>
                  <p className="font-medium">
                    {new Date(initialData.created_at).toLocaleDateString(
                      "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan actuel */}
      {initialData.plan && (
        <Card className="rounded-2xl border-slate-200 shadow-sm dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Plan actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {initialData.plan.name}
                </h3>
                {initialData.plan.description && (
                  <p className="text-gray-600 mt-1">
                    {initialData.plan.description}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-sm">
                Plan actif
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Refuser la demande</DialogTitle>
            <DialogDescription>
              Le motif sera enregistré avec le statut refusé.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Motif du refus…" rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isProcessing}>Annuler</Button>
            <Button variant="destructive" onClick={() => handleStatusChange("decline")} disabled={isProcessing || !comment.trim()}>
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
