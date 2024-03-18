import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useToast } from "../ui/use-toast";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import React from "react";

const formSchema = z.object({
  entrepriseId: z.string(),
  balanceToAdd: z.string()
});

type FormValues = z.infer<typeof formSchema>;

export const AddBalanceToEntreprise: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const authToken = Cookies.get("authToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${data.entrepriseId}/add-balance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
          description: "Balance added successfully!"
        });
      } else {
        throw new Error("Failed to add balance");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        variant: "destructive",
        description:
          error.message || "An error occurred while adding balance."
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
        <FormField
          control={form.control}
          name="entrepriseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entreprise ID</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="balanceToAdd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Balance to Add</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="ml-auto" type="submit">
          Add Balance
        </Button>
      </form>
    </Form>
  );
};