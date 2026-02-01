import Image from "next/image";
import { CheckCircle, XCircle, Mail, Phone, Globe, Users, MapPin, Building2, Calendar, ExternalLink, Award, Clock } from "lucide-react";
import { EnterpriseData } from "@/types";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";

export const EntrepriseProfile: React.FC<{ initialData: EnterpriseData }> = ({
  initialData
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isPending = initialData.is_verified === "Pending";
  const isAccepted = initialData.is_verified === "Accepted";
  const isDeclined = initialData.is_verified === "Declined";

  const handleStatusChange = async (action: 'accept' | 'decline') => {
    setIsProcessing(true);
    try {
      // Ici vous pouvez ajouter l'appel API pour changer le statut
      // await updateEnterpriseStatus(initialData.id, action);
      toast({
        title: action === 'accept' ? "Entreprise acceptée" : "Entreprise refusée",
        description: `Le statut de ${initialData.company_name} a été mis à jour.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
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
    <div className="grid gap-6 max-w-6xl mx-auto">
      {/* En-tête avec logo et informations principales */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo et nom */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={initialData.logo} 
                  alt={`${initialData.company_name} Logo`}
                />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {initialData.company_name?.charAt(0) || 'E'}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900">
                  {initialData.company_name}
                </h1>
                {initialData.sector && (
                  <Badge variant="outline" className="mt-2">
                    <Building2 className="h-3 w-3 mr-1" />
                    {typeof initialData.sector === 'object' ? initialData.sector.name : initialData.sector}
                  </Badge>
                )}
              </div>
            </div>

            {/* Statut et actions */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="flex justify-end">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="font-medium">
                    {isAccepted ? "Acceptée" : isPending ? "En attente" : "Refusée"}
                  </span>
                </div>
              </div>

              {isPending && (
                <div className="flex gap-3 justify-end mt-4">
                  <Button
                    onClick={() => handleStatusChange('decline')}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  <Button
                    onClick={() => handleStatusChange('accept')}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de contact */}
        <Card>
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
        <Card>
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
                    {new Date(initialData.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plan actuel */}
      {initialData.plan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Plan actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{initialData.plan.name}</h3>
                {initialData.plan.description && (
                  <p className="text-gray-600 mt-1">{initialData.plan.description}</p>
                )}
              </div>
              <Badge variant="outline" className="text-sm">
                Plan actif
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
