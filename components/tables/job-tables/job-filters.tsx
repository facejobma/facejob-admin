"use client";
import { FC } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter, Briefcase } from "lucide-react";

interface JobFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  sectorFilter: string;
  onSectorChange: (value: string) => void;
  sectors: Array<{ id: number; name: string }>;
  totalResults: number;
}

export const JobFilters: FC<JobFiltersProps> = ({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sectorFilter,
  onSectorChange,
  sectors,
  totalResults,
}) => {
  const hasFilters = searchValue || statusFilter !== "all" || sectorFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onStatusChange("all");
    onSectorChange("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre ou entreprise..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white shadow-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Filtre par statut */}
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white shadow-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                Tous les statuts
              </div>
            </SelectItem>
            <SelectItem value="Pending">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                En attente
              </div>
            </SelectItem>
            <SelectItem value="Accepted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Acceptées
              </div>
            </SelectItem>
            <SelectItem value="Declined">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                Refusées
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Filtre par secteur */}
        <Select value={sectorFilter} onValueChange={onSectorChange}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white shadow-sm border-slate-200 focus:border-blue-400 focus:ring-blue-400">
            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Secteur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les secteurs</SelectItem>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.name}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Bouton réinitialiser */}
        {hasFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={clearFilters}
            title="Réinitialiser les filtres"
            className="flex-shrink-0 bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:scale-105"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Résultats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-medium text-slate-700">{totalResults}</span>
          <span>résultat{totalResults > 1 ? 's' : ''}</span>
        </div>
        {hasFilters && (
          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            Filtres actifs
          </Badge>
        )}
      </div>
    </div>
  );
};
