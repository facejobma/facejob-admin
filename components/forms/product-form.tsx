"use client";
import * as z from "zod";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

import { useToast } from "../ui/use-toast";
import Cookies from "js-cookie";

import FileUpload from "../file-upload";

const ImgSchema = z.object({
  fileName: z.string(),
  name: z.string(),
  fileSize: z.number(),
  size: z.number(),
  fileKey: z.string(),
  key: z.string(),
  fileUrl: z.string(),
  url: z.string()
});

export const IMG_MAX_LIMIT = 3;

const formSchema = z.object({
  imgUrl: z
    .array(ImgSchema)
    .max(1, { message: "Vous ne pouvez ajouter qu'une seule image de profil" })
    .optional(),
  first_name: z
    .string()
    .min(2, { message: "Le prénom doit contenir au moins 2 caractères" }),
  sector: z
    .string()
    .min(2, { message: "Le secteur doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  tel: z.string().min(10, { message: "Numéro de téléphone invalide" }),
  bio: z.string().min(3, { message: "La bio doit contenir au moins 3 caractères" })
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData: any | null;
  categories: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({
                                                          initialData
                                                        }) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const defaultValues = initialData
    ? initialData
    : {
      first_name: "",
      sector: "",
      email: "",
      tel: "",
      bio: "",
      imgUrl: []
    };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);

      // Extract candidate ID from params
      const candidateId = params.userId;
      const authToken = Cookies.get("authToken");


      // Send a request to the API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/updateId/${candidateId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      // Check if the request was successful
      if (response.ok) {
        // Display success toast
        toast({
          title: "succès",
          variant: "default",
          description: "Candidate data saved successfully!"
        });

        // Redirect to the dashboard or candidate details page
        if (candidateId) {
          router.push(`/dashboard/candidate/${candidateId}`);
        } else {
          router.push("/dashboard/products");
        }
      } else {
        // If the request was not successful, display an error toast
        toast({
          title: "Whoops !",
          variant: "destructive",
          description: "Erreur lors de la récupération des données."
        });
      }
    } catch (error: any) {
      // Display error toast
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while saving candidate data."
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);

      // Extract candidate ID from params
      const candidateId = params.userId;
      const authToken = localStorage.getItem("authToken");

      // Send a request to delete the candidate
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate/delete/${candidateId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
          description: "Candidate deleted successfully!"
        });

        router.push("/dashboard/products");
      } else {
        toast({
          title: "Whoops !",
          variant: "destructive",
          description: "Erreur lors de la suppression du candidat."
        });
      }
    } catch (error: any) {
      // Display error toast
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while deleting the candidate."
      });
    } finally {
      setLoading(false);
    }
  };

  function setOpen(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Profil du Candidat"
          description="Modifier les informations du candidat"
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
                <FormLabel>Photo de Profil</FormLabel>
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
          
          <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Prénom du candidat"
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
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Secteur d'activité"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="md:grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Adresse email"
                      type="email"
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
                      disabled={loading}
                      placeholder="Numéro de téléphone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biographie</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    placeholder="Description du candidat"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button disabled={loading} className="ml-auto" type="submit">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </Form>
    </>
  );
};
