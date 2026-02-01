import * as z from "zod";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { useToast } from "../ui/use-toast";
import Cookies from "js-cookie";
import FileUpload from "../file-upload";
import { Sector } from "@/types";

const ImgSchema = z.object({
  fileName: z.string(),
  name: z.string(),
  fileSize: z.number(),
  size: z.number(),
  fileKey: z.string(),
  key: z.string(),
  fileUrl: z.string(),
  url: z.string(),
});

export const IMG_MAX_LIMIT = 3;

const formSchema = z.object({
  imgUrl: z
    .array(ImgSchema)
    .max(IMG_MAX_LIMIT, { message: "You can only add up to 3 images" })
    .min(1, { message: "At least one image must be added." }),
  company_name: z
    .string()
    .min(3, { message: "Company Name must be at least 3 characters" }),
  sector: z
    .string()
    .min(1, { message: "Sector is required" })
    .transform((val) => val === "" ? undefined : val),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Invalid phone number" }),
  adresse: z
    .string()
    .min(3, { message: "Address must be at least 3 characters" }),
  site_web: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal("")),
  effectif: z.number().int().min(1, { message: "Effectif must be a positive integer" }),
  description: z
    .string()
    .min(3, { message: "Description must be at least 3 characters" }),
  city: z.string().optional(),
  linkedin: z.string().optional(),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  legal_form: z.string().optional(),
  ice_number: z.string().optional(),
  rc_number: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
  categories: any;
}

export const EntrepriseForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const authToken = Cookies.get("authToken");

  const defaultValues = initialData
    ? {
        ...initialData,
        sector: initialData.sector?.id?.toString() || "",
        effectif: typeof initialData.effectif === 'string' ? parseInt(initialData.effectif) || 0 : initialData.effectif || 0,
        founded_year: initialData.founded_year || undefined,
      }
    : {
        company_name: "",
        sector: "",
        email: "",
        phone: "",
        adresse: "",
        site_web: "",
        effectif: 0,
        description: "",
        city: "",
        linkedin: "",
        founded_year: undefined,
        legal_form: "",
        ice_number: "",
        rc_number: "",
        imgUrl: [],
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setSectors(Array.isArray(result) ? result : result.data || []);
        }
      } catch (error) {
        console.error("Error fetching sectors:", error);
      }
    };

    fetchSectors();
  }, [authToken]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      const enterpriseId = params.id;
      const authToken = Cookies.get("authToken");

      // Prepare the data with proper formatting
      const formattedData = {
        company_name: data.company_name,
        email: data.email,
        phone: data.phone,
        adresse: data.adresse,
        site_web: data.site_web || "",
        effectif: Number(data.effectif), // Ensure it's a number
        description: data.description,
        sector_id: data.sector ? Number(data.sector) : null, // Send sector_id instead of sector
        city: data.city || "",
        linkedin: data.linkedin || "",
        founded_year: data.founded_year || null,
        legal_form: data.legal_form || "",
        ice_number: data.ice_number || "",
        rc_number: data.rc_number || "",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/entreprise/update/${enterpriseId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
          description: "Enterprise data saved successfully!",
        });

        if (enterpriseId) {
          router.push(`/dashboard/entreprise/${enterpriseId}`);
        } else {
          router.push("/dashboard/entreprise");
        }
      } else {
        throw new Error("Failed to save enterprise data");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while saving enterprise data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      const enterpriseId = params.id;
      const authToken = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/admin/enterprise/delete/${enterpriseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
          description: "Enterprise deleted successfully!",
        });

        router.push("/dashboard/entreprise");
      } else {
        throw new Error("Failed to delete enterprise");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while deleting the enterprise.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Enterprise Form"
          description="Edit or Create an Enterprise"
        />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="imgUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <FileUpload
                    onChange={field.onChange}
                    onRemove={field.onChange}
                    value={field.value || []}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Enterprise's company name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secteur</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un secteur" />
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Enterprise's email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Enterprise's phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Enterprise's description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Enterprise's address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ville</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="City"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="site_web"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Web</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="LinkedIn profile URL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="effectif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effectif</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      type="number"
                      placeholder="Number of employees"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="founded_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année de Création</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      type="number"
                      placeholder="Founded year"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="legal_form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forme Juridique</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Legal form"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro ICE</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="ICE number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rc_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro RC</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="RC number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save
          </Button>
        </form>
      </Form>
    </>
  );
};
