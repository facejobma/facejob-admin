import { Metadata } from "next";
import UserAuthForm from "@/components/forms/user-auth-form";
import { Logo } from "@/components/ui/logo";
import {
  Database,
  LockKeyhole,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Administration FaceJob - Connexion",
  description:
    "Interface d'administration FaceJob - Accès réservé aux super administrateurs.",
};

const adminFeatures = [
  {
    icon: UsersRound,
    title: "Utilisateurs",
    description: "Gérez les comptes et les accès",
  },
  {
    icon: Settings2,
    title: "Configuration",
    description: "Pilotez les paramètres globaux",
  },
  {
    icon: Database,
    title: "Données",
    description: "Contrôlez les ressources système",
  },
];

export default function AuthenticationPage() {
  return (
    <main className="h-screen overflow-y-auto bg-slate-50 text-slate-950 lg:grid lg:grid-cols-2">
      <section className="hidden min-h-screen bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
        <header className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 [&_img]:h-10 [&_img]:w-10 [&_img]:object-contain">
            <Logo />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              Face<span className="text-emerald-400">Job</span>
            </p>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-400">
              ESPACE ADMINISTRATION
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-xl py-10">
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Tableau de bord
            <span className="block text-emerald-400">Administrateur</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
            Accédez aux outils de gestion et de supervision de la plateforme
            FaceJob.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {adminFeatures.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-700 bg-slate-800/70 p-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-emerald-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white">
                      {title}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-slate-800 pt-5 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} FaceJob</span>
          <span className="flex items-center gap-2">
            <LockKeyhole
              className="h-3.5 w-3.5 text-emerald-500"
              aria-hidden="true"
            />
            Accès réservé aux administrateurs
          </span>
        </footer>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm [&_img]:h-8 [&_img]:w-8 [&_img]:object-contain">
              <Logo />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                Face<span className="text-emerald-600">Job</span>
              </p>
              <p className="text-xs font-medium text-slate-500">
                Administration
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Accès administrateur
            </div>
            <h2 className="text-3xl font-bold text-slate-950">Connexion</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Connectez-vous pour accéder au panneau d’administration FaceJob.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <UserAuthForm />
          </div>

          <p className="mt-7 text-center text-xs leading-5 text-slate-500">
            En vous connectant, vous accédez à un espace réservé et sécurisé.
          </p>
        </div>
      </section>
    </main>
  );
}
