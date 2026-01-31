"use client";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Entrez une adresse courriel valide" }),
  password: z.string().min(6, {
    message: "Le mot de passe doit comporter au moins 6 caractères",
  }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        const { token } = result;
        Cookies.set("authToken", token, { expires: 7 });
        
        toast({
          title: "Connexion réussie!",
          variant: "default",
          description: "Bienvenue dans votre espace d'administration.",
        });
        
        router.push("/dashboard");
      } else {
        throw new Error(result.message || "Erreur de connexion");
      }
    } catch (error: any) {
      toast({
        title: "Erreur de connexion",
        variant: "destructive",
        description: error.message || "Vérifiez vos identifiants et réessayez.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Adresse email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="admin@facejob.com"
                      disabled={isLoading}
                      className="pl-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  Mot de passe
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 transition-colors"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Mot de passe oublié?
              </a>
            </div>
          </div>

          <Button
            disabled={isLoading}
            className="w-full h-12 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200 font-medium text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Besoin d'aide?{" "}
          <a href="#" className="font-medium text-green-600 hover:text-green-500 transition-colors">
            Contactez le support
          </a>
        </p>
      </div>
    </div>
  );
}
