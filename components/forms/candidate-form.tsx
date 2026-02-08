"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, User, Mail, Phone, MapPin, Briefcase, FileText } from "lucide-react";
import { User as UserType, Sector } from "@/types";
import Cookies from "js-cookie";

const candidateFormSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").optional(),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").optional(),
  nomComplete: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères").optional(),
  email: z.string().email("Email invalide"),
  tel: z.string().optional(),
  bio: z.string().optional(),
  sector_id: z.string().optional(),
  ville: z.string().optional(),
  adresse: z.string().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface CandidateFormProps {
  initialData?: UserType;
  onSubmit: (data: CandidateFormValues) => Promise<void>;
  loading?: boolean;
}

export function CandidateForm({ initialData, onSubmit, loading = false }: CandidateFormProps) {
  const { toast } = useToast();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const authToken = Cookies.get("authToken");

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      nomComplete: initialData?.nomComplete || "",
      email: initialData?.email || "",
      tel: initialData?.tel || initialData?.phone || "",
      bio: initialData?.bio || "",
      sector_id: typeof initialData?.sector === 'object' ? initialData?.sector?.id?.toString() : "",
      ville: (initialData as any)?.ville || "",
      adresse: (initialData as any)?.adresse || "",
    },
  });

  // Fetch sectors
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSectors(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          setSectors(Array.isArray(result) ? result : result.data || []);
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
        toast({
          title: "Erreur",
          variant: "destructive",
          description: "Impossible de charger les secteurs.",
        });
      } finally {
        setLoadingSectors(false);
      }
    };

    fetchSectors();
  }, [authToken, toast]);

  const handleSubmit = async (values: CandidateFormValues) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informations personnelles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Prénom du candidat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du candidat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="nomComplete"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom complet (si différent)</FormLabel>
                <FormControl>
                  <Input placeholder="Nom complet du candidat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informations de contact</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="email@exemple.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="+33 6 12 34 56 78" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Location Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Localisation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ville"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input placeholder="Ville de résidence" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse complète" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Briefcase className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Informations professionnelles</h3>
          </div>

          <FormField
            control={form.control}
            name="sector_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={loadingSectors}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSectors ? "Chargement..." : "Sélectionner un secteur"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id.toString()}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biographie / Présentation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Décrivez brièvement le profil du candidat, ses compétences et son expérience..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}