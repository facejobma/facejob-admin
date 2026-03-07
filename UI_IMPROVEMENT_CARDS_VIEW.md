# Amélioration UI: Vue Cartes et Tableau

## ✨ Nouvelle fonctionnalité

Ajout d'un toggle pour basculer entre l'affichage en tableau (lignes) et en cartes pour les offres d'emploi.

## 📁 Fichiers créés

### 1. components/tables/job-tables/job-card-view.tsx
Nouveau composant pour l'affichage en cartes avec:
- ✅ Design moderne avec cartes hover
- ✅ Icônes pour chaque information
- ✅ Badges de statut colorés
- ✅ Statistiques (candidatures, vues)
- ✅ Actions via CellAction
- ✅ Layout responsive (1/2/3 colonnes selon la taille d'écran)

## 📝 Fichiers modifiés

### 1. components/tables/job-tables/requests.tsx
- ✅ Ajout prop `viewMode?: "table" | "cards"`
- ✅ Rendu conditionnel selon le mode
- ✅ Import du composant JobCardView

### 2. app/(dashboard)/dashboard/jobs/page.tsx
- ✅ Ajout state `viewMode` avec useState
- ✅ Import des icônes `LayoutGrid` et `List`
- ✅ Boutons toggle pour changer de vue
- ✅ Passage du prop `viewMode` à JobRequests

### 3. types/index.ts
- ✅ Ajout `applications_count?: number`
- ✅ Ajout `views_count?: number`

## 🎨 Design

### Vue Tableau (par défaut)
```
┌─────────────────────────────────────────────┐
│ Titre | Localisation | Dates | Statut | ... │
├─────────────────────────────────────────────┤
│ ...                                         │
└─────────────────────────────────────────────┘
```

### Vue Cartes
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Carte 1 │ │  Carte 2 │ │  Carte 3 │
│  ┌────┐  │ │  ┌────┐  │ │  ┌────┐  │
│  │Icon│  │ │  │Icon│  │ │  │Icon│  │
│  └────┘  │ │  └────┘  │ │  └────┘  │
│  Titre   │ │  Titre   │ │  Titre   │
│  Info    │ │  Info    │ │  Info    │
│  [Badge] │ │  [Badge] │ │  [Badge] │
└──────────┘ └──────────┘ └──────────┘
```

## 🔘 Toggle Button

Position: En haut à droite, à côté du bouton "Actualiser"

```tsx
<div className="flex items-center border rounded-md">
  <Button variant={viewMode === "table" ? "default" : "ghost"}>
    <List className="h-4 w-4" />
  </Button>
  <Button variant={viewMode === "cards" ? "default" : "ghost"}>
    <LayoutGrid className="h-4 w-4" />
  </Button>
</div>
```

## 📱 Responsive

### Desktop (lg: ≥1024px)
- Tableau: Toutes les colonnes visibles
- Cartes: 3 colonnes

### Tablet (md: ≥768px)
- Tableau: Colonnes principales
- Cartes: 2 colonnes

### Mobile (< 768px)
- Tableau: Scroll horizontal
- Cartes: 1 colonne

## 🎯 Fonctionnalités des cartes

Chaque carte affiche:
- ✅ Icône de l'offre (Briefcase)
- ✅ Titre de l'offre (tronqué à 2 lignes)
- ✅ Nom de l'entreprise
- ✅ Badge de statut (Pending/Accepted/Declined)
- ✅ Secteur d'activité
- ✅ Localisation
- ✅ Type de contrat
- ✅ Dates de début et fin
- ✅ Nombre de candidatures
- ✅ Nombre de vues
- ✅ Date de création
- ✅ Menu d'actions (CellAction)

## 🎨 Couleurs des badges

```typescript
Pending (En attente):
  bg-yellow-100 text-yellow-800 border-yellow-200

Accepted (Publiée):
  bg-green-100 text-green-800 border-green-200

Declined (Refusée):
  bg-red-100 text-red-800 border-red-200
```

## 🚀 Utilisation

```tsx
// Dans page.tsx
const [viewMode, setViewMode] = useState<"table" | "cards">("table");

// Toggle
<Button onClick={() => setViewMode("table")}>
  <List />
</Button>
<Button onClick={() => setViewMode("cards")}>
  <LayoutGrid />
</Button>

// Passage à JobRequests
<JobRequests 
  data={jobs} 
  onUpdate={fetchData} 
  viewMode={viewMode} 
/>
```

## ✅ Avantages

### Vue Tableau
- ✅ Affichage compact
- ✅ Tri et filtrage faciles
- ✅ Comparaison rapide
- ✅ Idéal pour beaucoup de données

### Vue Cartes
- ✅ Affichage visuel attractif
- ✅ Plus d'informations visibles
- ✅ Meilleure lisibilité
- ✅ Idéal pour parcourir les offres

## 🔄 État persistant (optionnel)

Pour sauvegarder la préférence de l'utilisateur:

```tsx
// Charger depuis localStorage
const [viewMode, setViewMode] = useState<"table" | "cards">(
  () => (localStorage.getItem("jobsViewMode") as "table" | "cards") || "table"
);

// Sauvegarder lors du changement
useEffect(() => {
  localStorage.setItem("jobsViewMode", viewMode);
}, [viewMode]);
```

## 📊 Métriques

- Temps de chargement: Identique aux deux vues
- Performance: Optimisée avec React.memo si nécessaire
- Accessibilité: Boutons avec aria-labels

## 🧪 Tests

Vérifier:
- [ ] Toggle fonctionne correctement
- [ ] Vue tableau affiche toutes les données
- [ ] Vue cartes affiche toutes les informations
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Actions (accepter/refuser) fonctionnent dans les deux vues
- [ ] Filtres par onglet fonctionnent dans les deux vues
- [ ] Pas d'erreurs dans la console

## 🎉 Résultat

L'interface admin offre maintenant deux modes d'affichage:
- **Tableau**: Pour une vue d'ensemble rapide et compacte
- **Cartes**: Pour une expérience visuelle riche et détaillée

Les utilisateurs peuvent basculer entre les deux vues selon leurs besoins!
