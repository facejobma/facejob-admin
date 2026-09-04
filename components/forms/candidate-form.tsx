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
import {
  Loader2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  X,
} from "lucide-react";
import { User as UserType, Sector } from "@/types";
import Cookies from "js-cookie";

const candidateFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100),
  last_name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
  email: z.string().email("Email invalide"),
  tel: z.string().max(30, "30 caractères maximum").optional(),
  bio: z.string().max(5000, "5000 caractères maximum").optional(),
  sector_id: z.string().optional(),
  job_id: z.string().optional(),
  address: z.string().max(255, "255 caractères maximum").optional(),
  preferred_location: z.string().max(150, "150 caractères maximum").optional(),
  years_of_experience: z
    .string()
    .refine(
      (value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 60),
      "Entrez une valeur entre 0 et 60",
    ),
  availability_status: z.enum(["available", "unavailable"]),
  is_active: z.boolean(),
  preferred_contract_type: z.string().optional(),
});

type CandidateFormValues = z.infer<typeof candidateFormSchema>;

interface CandidateFormProps {
  initialData?: UserType;
  onSubmit: (data: CandidateFormValues) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function CandidateForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: CandidateFormProps) {
  const { toast } = useToast();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const authToken = Cookies.get("authToken");

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      tel: initialData?.tel || initialData?.phone || "",
      bio: initialData?.bio || "",
      sector_id:
        initialData?.job?.sector_id?.toString() ||
        (typeof initialData?.sector === "object"
          ? initialData?.sector?.id?.toString()
          : ""),
      job_id: initialData?.job?.id?.toString() || "",
      address:
        (initialData as any)?.address || (initialData as any)?.adresse || "",
      preferred_location: (initialData as any)?.preferred_location || "",
      years_of_experience:
        (initialData as any)?.years_of_experience?.toString() || "",
      availability_status:
        (initialData as any)?.availability_status === "unavailable"
          ? "unavailable"
          : "available",
      is_active: initialData?.is_active ?? true,
      preferred_contract_type: initialData?.preferred_contract_type || "",
    },
  });

  // Fetch sectors
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoadingSectors(true);
        const response = await fetch("/api/v1/sectors", {
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
    await onSubmit(values);
  };

  const selectedSectorId = form.watch("sector_id");
  const selectedSector = sectors.find(
    (sector) => String(sector.id) === selectedSectorId,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        {/* Personal Information Section */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Informations personnelles</h3>
              <p className="text-xs text-slate-500">
                Identité affichée sur la plateforme
              </p>
            </div>
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
        </div>

        {/* Contact Information Section */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="rounded-xl bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Informations de contact</h3>
              <p className="text-xs text-slate-500">
                Coordonnées privées du candidat
              </p>
            </div>
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
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Localisation</h3>
              <p className="text-xs text-slate-500">
                Adresse actuelle et mobilité recherchée
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preferred_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localisation préférée</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex. Casablanca, Rabat ou télétravail"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse actuelle</FormLabel>
                  <FormControl>
                    <Input placeholder="Adresse du candidat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Professional Information Section */}
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
            <span className="rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-semibold">Informations professionnelles</h3>
              <p className="text-xs text-slate-500">
                Données utilisées pour le matching
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="sector_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur d'activité</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("job_id", "");
                  }}
                  defaultValue={field.value}
                  disabled={loadingSectors}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingSectors
                            ? "Chargement..."
                            : "Sélectionner un secteur"
                        }
                      />
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

          <FormField
            control={form.control}
            name="job_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Métier ciblé (facultatif)</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? "" : value)
                  }
                  value={field.value || "none"}
                  disabled={!selectedSectorId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedSectorId
                            ? "Sélectionner un métier"
                            : "Sélectionnez d'abord un secteur"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">
                      Aucun métier de référence
                    </SelectItem>
                    {(selectedSector?.jobs || []).map((job) => (
                      <SelectItem key={job.id} value={String(job.id)}>
                        {job.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Le candidat reste utilisable sans métier normalisé.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="years_of_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Années d&apos;expérience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={60}
                      placeholder="Ex. 5"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_contract_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de contrat préféré</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Aucune préférence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucune préférence</SelectItem>
                      {["CDI", "CDD", "Stage", "Freelance", "Alternance"].map(
                        (contract) => (
                          <SelectItem key={contract} value={contract}>
                            {contract}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="availability_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilité pour les recruteurs</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="unavailable">Indisponible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Compte actif</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Un candidat désactivé est exclu du matching.
                      </p>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl sm:min-w-[130px]"
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 sm:min-w-[180px] hover:bg-emerald-700"
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
