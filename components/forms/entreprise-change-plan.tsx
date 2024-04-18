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
import React, { useEffect, useState } from "react";
import { PlanDetails } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";


const formSchema = z.object({
  entrepriseId: z.string(),
  planId: z.string(),
  duration: z.string()
});

const durations = [
  { id: 3, name: "Mensuelle" },
  { id: 12, name: "Annuelle" },
  { id: 4, name: "Trimestrielle" }
];

type FormValues = z.infer<typeof formSchema>;

export const ChangePlanToEntreprise: React.FC = () => {
    const { toast } = useToast();
    const authToken = Cookies.get("authToken");
    const [plans, setPlans] = useState([] as PlanDetails[]);

    const form = useForm<FormValues>({
      resolver: zodResolver(formSchema)
    });
    const onSubmit = async (data: FormValues) => {
      try {

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${data.entrepriseId}/change-plan`,
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
            description: "plan added successfully!"
          });
        } else {
          toast({
            title: "Error",
            variant: "destructive",
            description:
              "Error lors de l'ajout du plan."
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          variant: "destructive",
          description:
            error.message || "Erreur lors de l'ajout du plan."
        });
      }
    };

    useEffect(() => {
      async function getPlans() {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/plans`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json"
            }
          })
          .then((response) => response.json())
          .then((result: PlanDetails[]) => {
            setPlans(result);
          })
          .catch((error) => {
            toast({
              title: "Whoops!",
              variant: "destructive",
              description: error.message
            });
          });

      }

      getPlans();
    }, [authToken, setPlans, toast]);

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
                  <Input {...field} placeholder={"Enter l'id de l'entreprise"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un forfait" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plan</SelectLabel>
                      {Object.values(plans).map((value) => (
                        <SelectItem key={value.id} value={value.id.toString()}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée</FormLabel>
                <Select onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une durée" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Plan</SelectLabel>
                      {durations.map((value) => (
                        <SelectItem key={value.id} value={value.id.toString()}>
                          {value.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="ml-auto" type="submit">
            Change plan
          </Button>
        </form>
      </Form>
    );
  }
;