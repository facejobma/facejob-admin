import { Metadata } from "next";
import UserAuthForm from "@/components/forms/user-auth-form";
import { Logo } from "@/components/ui/logo";
import { Shield, Settings, Database, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Administration FaceJob - Connexion",
  description: "Interface d'administration FaceJob - Accès réservé aux super administrateurs.",
};

export default function AuthenticationPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden relative">
      {/* Subtle background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-green-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="flex h-screen relative z-10">
        {/* Left Panel - Clean Admin Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent"></div>
          
          <div className="relative z-10 flex flex-col justify-between p-6 text-white w-full h-full">
            {/* Header with logo in top-left position */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-lg"></div>
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30 shadow-2xl">
                  <Logo />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-green-300 bg-clip-text text-transparent">
                  FaceJob
                </h1>
                <p className="text-green-300 text-base font-medium">Administration</p>
                <p className="text-gray-400 text-xs">Interface Super Administrateur</p>
              </div>
            </div>

            {/* Main Content - Compact */}
            <div className="space-y-4 flex-1 flex flex-col justify-center max-w-md mx-auto">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold leading-tight">
                  Tableau de bord<br />
                  <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    Administrateur
                  </span>
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Accédez aux outils de gestion et de supervision de la plateforme FaceJob.
                </p>
              </div>

              {/* Simple admin features grid - Very compact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-dark rounded-xl p-3 border border-green-500/20 text-center">
                  <Users className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                  <h3 className="font-semibold text-xs mb-1">Utilisateurs</h3>
                  <p className="text-xs text-gray-400">Gestion complète</p>
                </div>
                
                <div className="glass-dark rounded-xl p-3 border border-green-500/20 text-center">
                  <Database className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                  <h3 className="font-semibold text-xs mb-1">Base de données</h3>
                  <p className="text-xs text-gray-400">Supervision système</p>
                </div>
                
                <div className="glass-dark rounded-xl p-3 border border-green-500/20 text-center">
                  <Settings className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                  <h3 className="font-semibold text-xs mb-1">Configuration</h3>
                  <p className="text-xs text-gray-400">Paramètres globaux</p>
                </div>
                
                <div className="glass-dark rounded-xl p-3 border border-green-500/20 text-center">
                  <Shield className="h-6 w-6 text-green-400 mb-2 mx-auto" />
                  <h3 className="font-semibold text-xs mb-1">Sécurité</h3>
                  <p className="text-xs text-gray-400">Contrôle d'accès</p>
                </div>
              </div>
            </div>

            {/* Simple footer - Minimal */}
            <div className="text-center">
              <p className="text-gray-400 text-xs">
                Interface réservée aux super administrateurs
              </p>
              <p className="text-gray-500 text-xs">
                Accès sécurisé et contrôlé
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Clean Login Form */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative">
          {/* Minimal background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-green-100 rounded-full blur-2xl"></div>
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-green-50 rounded-full blur-xl"></div>
          </div>
          
          <div className="w-full max-w-sm space-y-6 relative z-10">
            {/* Mobile Logo - Compact but prominent */}
            <div className="lg:hidden text-center">
              <div className="inline-flex flex-col items-center space-y-2 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 rounded-2xl blur-md"></div>
                  <div className="relative bg-white rounded-2xl p-3 border-2 border-green-300 shadow-xl">
                    <Logo />
                  </div>
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-700 bg-clip-text text-transparent">
                    FaceJob
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">Administration</p>
                  <p className="text-gray-500 text-xs">Super Administrateur</p>
                </div>
              </div>
            </div>

            {/* Clean Welcome Section - Compact */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full mb-2">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-green-700 text-xs font-medium">Accès Administrateur</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Connexion
              </h2>
              <p className="text-gray-600 text-sm">
                Identifiez-vous pour accéder au panneau d'administration
              </p>
            </div>

            {/* Clean Login Form - Compact */}
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 relative overflow-hidden">
              {/* Minimal background accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-full -translate-y-8 translate-x-8 opacity-50"></div>
              
              <div className="relative z-10">
                <UserAuthForm />
              </div>
            </div>

            {/* Clean Footer - Minimal */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-500">
                © 2026 FaceJob. Interface d'administration.
              </p>
              <p className="text-xs text-gray-400">
                Système sécurisé - Accès contrôlé
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}