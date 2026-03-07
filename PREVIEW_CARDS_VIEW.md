# 🎨 Aperçu de la nouvelle interface

## Toggle Button (En haut à droite)

```
┌─────────────────────────────────────────────────────────────┐
│  Offres d'emploi                    [═][▦] [↻] [↓]          │
│  📊 45 offres • Dernière mise à jour: 14:30                  │
└─────────────────────────────────────────────────────────────┘
     Vue actuelle: ═ Tableau  ▦ Cartes
```

## Vue Tableau (Mode par défaut)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ☐  Offre d'emploi              │ Localisation  │ Dates    │ Statut  │ ⋮ │
├──────────────────────────────────────────────────────────────────────────┤
│ ☐  💼 Développeur Full Stack   │ 📍 Casablanca │ 📅 Dates │ 🟢 Pub  │ ⋮ │
│     🏢 TechCorp                 │ CDI           │          │         │   │
│     📄 Informatique             │               │          │         │   │
├──────────────────────────────────────────────────────────────────────────┤
│ ☐  💼 Data Scientist           │ 📍 Rabat      │ 📅 Dates │ 🟡 Att  │ ⋮ │
│     🏢 DataLab                  │ CDD           │          │         │   │
│     📄 Data Science             │               │          │         │   │
└──────────────────────────────────────────────────────────────────────────┘
```

## Vue Cartes (Nouveau!)

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│ ┌────┐              │  │ ┌────┐              │  │ ┌────┐              │
│ │ 💼 │ Développeur  │  │ │ 💼 │ Data         │  │ │ 💼 │ Chef de     │
│ └────┘ Full Stack   │  │ └────┘ Scientist    │  │ └────┘ Projet      │
│                      │  │                      │  │                      │
│ 🏢 TechCorp          │  │ 🏢 DataLab          │  │ 🏢 InnovateCo       │
│ 📄 Informatique      │  │ 📄 Data Science     │  │ 📄 Management       │
│                      │  │                      │  │                      │
│ 📍 Casablanca        │  │ 📍 Rabat            │  │ 📍 Marrakech        │
│ 🏷️  CDI              │  │ 🏷️  CDD             │  │ 🏷️  CDI             │
│                      │  │                      │  │                      │
│ ─────────────────    │  │ ─────────────────    │  │ ─────────────────    │
│ 📅 Début: 01/03/26   │  │ 📅 Début: 15/03/26  │  │ 📅 Début: 01/04/26  │
│ 📅 Fin: 01/03/27     │  │ 📅 Fin: 15/09/26    │  │ 📅 Fin: 01/04/27    │
│                      │  │                      │  │                      │
│ ─────────────────    │  │ ─────────────────    │  │ ─────────────────    │
│ 👥 12 candidatures   │  │ 👥 8 candidatures   │  │ 👥 5 candidatures   │
│ 👁️  45 vues          │  │ 👁️  32 vues         │  │ 👁️  18 vues         │
│                      │  │                      │  │                      │
│ ─────────────────    │  │ ─────────────────    │  │ ─────────────────    │
│ Créée: 15/02/26  [⋮] │  │ Créée: 20/02/26  [⋮] │  │ Créée: 25/02/26  [⋮] │
│                      │  │                      │  │                      │
│ [🟢 Publiée]         │  │ [🟡 En attente]     │  │ [🔴 Refusée]        │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

## Menu d'actions (⋮)

Clic sur les trois points verticaux ouvre:

```
┌─────────────────────────────┐
│ Actions          [🟡 Badge] │
├─────────────────────────────┤
│ 👁️  Consulter les détails   │
│ ✏️  Modifier l'offre         │
├─────────────────────────────┤
│ 📋 Copier le lien           │
│ 🔗 Voir sur le site         │
│ 👥 Voir les candidatures    │
├─────────────────────────────┤
│ ✅ Accepter et publier      │
│ ❌ Refuser l'offre          │
├─────────────────────────────┤
│ 🗑️  Supprimer               │
└─────────────────────────────┘
```

## Responsive

### Desktop (≥1024px)
```
[Carte 1] [Carte 2] [Carte 3]
[Carte 4] [Carte 5] [Carte 6]
```

### Tablet (768px - 1023px)
```
[Carte 1] [Carte 2]
[Carte 3] [Carte 4]
```

### Mobile (<768px)
```
[Carte 1]
[Carte 2]
[Carte 3]
```

## Badges de statut

```
🟢 Publiée      → bg-green-100 text-green-800
🟡 En attente   → bg-yellow-100 text-yellow-800
🔴 Refusée      → bg-red-100 text-red-800
```

## Hover Effects

```
Carte au repos:
┌─────────────────────┐
│                     │
│   Contenu...        │
│                     │
└─────────────────────┘

Carte au survol:
┌═════════════════════┐  ← Shadow plus prononcée
║                     ║
║   Contenu...        ║
║                     ║
└═════════════════════┘
```

## Statistiques en haut de page

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🟡 En attente│ │ 🟢 Acceptées │ │ 🔴 Refusées  │ │ 📊 Taux      │
│              │ │              │ │              │ │              │
│     15       │ │     28       │ │      2       │ │    93%       │
│              │ │              │ │              │ │              │
│ Offres à     │ │ Offres       │ │ Offres       │ │ Sur 45       │
│ valider      │ │ publiées     │ │ rejetées     │ │ offres       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## Onglets de filtrage

```
┌─────────────────────────────────────────────────────────────┐
│ [Toutes (45)] [En attente (15)] [Acceptées (28)] [Refusées (2)] │
└─────────────────────────────────────────────────────────────┘
```

## Exemple complet d'une carte

```
┌─────────────────────────────────────────────────────────┐
│ ┌────┐                                                  │
│ │ 💼 │  Développeur Full Stack - Fintech        [🟢 Pub]│
│ └────┘                                                  │
│        🏢 TechCorp Maroc                                │
│        📄 Informatique & Technologies                   │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ 📄 Informatique & Technologies                          │
│ 📍 Casablanca, Maroc                                    │
│ 🏷️  CDI                                                 │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│ 📅 Début: 01/03/2026                                    │
│ 📅 Fin: 01/03/2027                                      │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│ 👥 12 candidatures    👁️ 45 vues                        │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│ Créée le 15/02/2026                              [⋮]    │
└─────────────────────────────────────────────────────────┘
```

## Animations

- ✨ Transition douce lors du changement de vue (300ms)
- ✨ Hover effect sur les cartes (shadow + scale)
- ✨ Rotation de l'icône refresh lors du chargement
- ✨ Fade in des cartes lors du chargement

## Accessibilité

- ✅ Boutons avec aria-labels
- ✅ Contraste des couleurs WCAG AA
- ✅ Navigation au clavier
- ✅ Focus visible sur les éléments interactifs
