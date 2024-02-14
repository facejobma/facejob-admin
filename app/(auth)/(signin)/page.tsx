import { Metadata } from "next";
import UserAuthForm from "@/components/forms/user-auth-form";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components."
};

export default function AuthenticationPage() {
  return (
    <div
      className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex bg-hero">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center">
          <Logo />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo; Notre philosophie est simple : Offrir à toutes les entreprises, à tous les chercheurs d’emploi la
              chance de s’entrecroiser, de se connecter de la manière la plus facile que jamais, la plus efficace que
              jamais.&rdquo;
            </p>
            <footer className="text-sm">Adil Erradi</footer>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center bg-gray-950">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back!
            </h1>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
