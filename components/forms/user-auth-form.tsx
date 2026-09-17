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
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);

    try {
      const rawBackend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const apiBase = rawBackend.replace(/\/api\/?$/, "");
      const response = await fetch(`${apiBase}/api/v1/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        const token = result.data?.token;
        if (!token) throw new Error("Token non reçu du serveur");

        Cookies.set("authToken", token, { expires: 7 });
        localStorage.setItem("authToken", token);
        sessionStorage.setItem("authToken", token);

        toast({
          title: "Connexion réussie !",
          variant: "default",
          description: "Bienvenue dans votre espace d'administration.",
        });
        router.push("/dashboard");
      } else {
        throw new Error(result.message || "Erreur de connexion");
      }
    } catch (error: unknown) {
      const description =
        error instanceof Error
          ? error.message
          : "Vérifiez vos identifiants et réessayez.";

      toast({
        title: "Erreur de connexion",
        variant: "destructive",
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-slate-700">
                Adresse e-mail
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    {...field}
                    value={field.value || ""}
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="admin@facejob.com"
                    disabled={isLoading}
                    className="h-[52px] rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-4 text-base text-slate-900 shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-emerald-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:bg-slate-100"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-semibold text-slate-700">
                Mot de passe
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    {...field}
                    value={field.value || ""}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Saisissez votre mot de passe"
                    disabled={isLoading}
                    className="h-[52px] rounded-xl border-slate-200 bg-slate-50/70 pl-11 pr-12 text-base text-slate-900 shadow-none transition placeholder:text-slate-400 hover:border-slate-300 focus-visible:border-emerald-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:bg-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    disabled={isLoading}
                    className="absolute right-2.5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            />
            Se souvenir de moi
          </label>
          <a
            href="mailto:support@facejob.ma?subject=Accès%20administration%20FaceJob"
            className="rounded-md text-sm font-semibold text-emerald-700 underline-offset-4 transition-colors hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Accès oublié ?
          </a>
        </div>

        <Button
          disabled={isLoading}
          className="group h-[52px] w-full rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:shadow-none"
          type="submit"
        >
          {isLoading ? (
            <>
              <Loader2
                className="mr-2 h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Connexion en cours...
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-slate-600">
          Un problème de connexion ?{" "}
          <a
            href="mailto:support@facejob.ma?subject=Support%20administration%20FaceJob"
            className="rounded-md font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            Contactez le support
          </a>
        </p>
      </form>
    </Form>
  );
}
