# Revenir - Application de Gestion des Addictions

> Application web progressive (PWA) pour le suivi et la gestion des addictions, avec un focus sur la confidentialité et le fonctionnement hors-ligne.

## 📋 Description

**Revenir** est une application web progressive (PWA) conçue pour aider à gérer et surmonter les addictions, avec un focus particulier sur la dépendance à la pornographie. L'application fonctionne entièrement hors-ligne, stocke toutes les données localement sur votre appareil, et ne nécessite aucune connexion Internet ni compte utilisateur.

### Caractéristiques principales

- 🔒 **100% Privé** : Toutes les données restent sur votre appareil
- 📱 **PWA** : Installable sur mobile et desktop
- 🌍 **Multi-langue** : Français, Anglais, Arabe (avec support RTL)
- 🌓 **Thèmes** : Mode clair et sombre
- 📊 **Dashboard** : Vue d'ensemble de vos données et insights
- 🧘 **Approche bienveillante** : Ton neutre, non culpabilisant
- ⚡ **Offline-first** : Fonctionne sans connexion Internet

## ✨ Fonctionnalités

### Fonctionnalités de base

- **Check-in quotidien** : Suivi de l'humeur, stress, envies, solitude
- **Protocole 90 secondes** : Gestion des cravings avec exercices de respiration guidés
- **Suivi de la série** : Compteur de jours consécutifs sans épisode
- **Mode après rechute** : Accompagnement structuré après un épisode
- **Import/Export JSON** : Sauvegarde et restauration de vos données

### Fonctionnalités avancées (V2/V3)

#### Intentions quotidiennes
- Intentions générées quotidiennement pour guider votre journée
- Engagement actionnable avec suivi

#### Règles "Si... Alors..."
- Création de règles personnalisées pour automatiser vos réponses
- Templates prédéfinis pour démarrer rapidement
- Suggestions automatiques basées sur vos patterns

#### Victoires invisibles
- Compteur de cravings résistés
- Estimation du temps gagné
- Suivi des actions positives

#### Rituels du soir
- Checklist personnalisable pour votre routine du soir
- Suivi de la régularité

#### Heatmap des risques
- Visualisation des moments à risque sur la semaine
- Filtres multi-facteurs (stress, moment de la journée)
- Identification des patterns

#### Mode expérimentation
- Test de nouvelles stratégies
- Suivi de l'efficacité
- A/B testing de vos approches

#### Features Anti-Porno spécifiques
- **Plan Nuit** : Routine configurable avec checklist
- **Pente glissante avancée** : Protocole en 3 étapes (Quitter/Eau/Mouvement)
- **Check-in rapide** : "Téléphone au lit ?"
- **Déclencheurs** : Identification et suivi des triggers

### Fonctionnalités V3

#### Bibliothèque d'actions
- Actions prédéfinies (mouvement, calme, social, etc.)
- Actions personnalisées
- Favoris et actions aléatoires

#### Coaching local
- Insights hebdomadaires automatiques
- Identification des corrélations (ex: stress élevé = cravings x2)
- Suggestions de règles basées sur vos patterns

#### Programmes guidés
- Programme 14 jours : Les bases pour reprendre le contrôle
- Programme 30 jours : Approfondissement des stratégies
- Micro-leçons et exercices CBT
- Urge Surfing guidé

#### Journal de bord
- Entrées avec tags pour filtrage
- Export JSON
- Recherche et organisation

#### SOS Avancé
- Écran SOS plein page
- Mode "Low-Text" (icônes grandes, texte minimal)
- Action aléatoire
- Intégration avec playlists spirituelles

#### Visualisations avancées
- Calendrier de sobriété (habit tracker)
- Timeline chronologique des événements
- Export des données

#### Features spirituelles avancées
- Playlists par contexte (matin, soir, crise, après épisode)
- Compteur Dhikr/Invocations
- Objectifs spirituels quotidiens

#### Dashboard
- Vue d'ensemble centralisée
- Widgets Insight, Règles, Heatmap
- Accès rapide depuis le menu outils

## 🚀 Installation

### Installation locale

1. Clonez ou téléchargez le projet
2. Ouvrez `app/index.html` dans un navigateur moderne
3. Ou servez les fichiers via un serveur web local :

```bash
# Avec Python 3
python -m http.server 8080

# Avec Node.js (http-server)
npx http-server -p 8080

# Avec PHP
php -S localhost:8080
```

4. Accédez à `http://localhost:8080` dans votre navigateur

### Installation PWA (Mobile/Desktop)

1. Ouvrez l'application dans votre navigateur
2. Sur mobile : Menu du navigateur → "Ajouter à l'écran d'accueil"
3. Sur desktop : Cliquez sur l'icône d'installation dans la barre d'adresse
4. L'application s'ouvrira comme une application native

## 📁 Structure du projet

```
antiaddictv2/
├── app/
│   ├── index.html              # Point d'entrée principal
│   ├── manifest.webmanifest    # Configuration PWA
│   ├── sw.js                   # Service Worker (cache offline)
│   ├── app.js                  # Logique principale
│   ├── router.js               # Navigation SPA
│   ├── storage.js              # Gestion localStorage + migrations
│   ├── i18n.js                 # Internationalisation
│   ├── utils.js                # Utilitaires (dates, stats)
│   ├── styles.css              # Styles globaux + thèmes
│   ├── data/
│   │   ├── texts/              # Fichiers de traduction
│   │   │   ├── strings.*.json  # Traductions UI
│   │   │   ├── programs_*.json # Contenu programmes guidés
│   │   │   └── spiritual_*.json # Cartes spirituelles
│   │   └── pictures/           # Images et icônes
│   └── features/               # Modules de fonctionnalités
│       ├── actions.js          # Bibliothèque d'actions
│       ├── antiporn.js         # Features anti-porno
│       ├── calendar.js         # Calendrier sobriété
│       ├── coaching.js         # Coaching local
│       ├── evening.js          # Rituels du soir
│       ├── experiments.js      # Mode expérimentation
│       ├── heatmap.js          # Heatmap risques
│       ├── ifthen.js           # Règles "si... alors..."
│       ├── intentions.js       # Intentions quotidiennes
│       ├── journal.js          # Journal de bord
│       ├── programs.js         # Programmes guidés
│       ├── relapse.js          # Mode après rechute
│       ├── sos.js              # SOS avancé
│       ├── spiritual.js        # Features spirituelles
│       └── wins.js             # Victoires invisibles
└── README.md                   # Ce fichier
```

## 🎨 Thèmes

L'application supporte deux thèmes :

- **Thème sombre** (par défaut) : Interface sombre adaptée à l'usage nocturne
- **Thème clair** : Interface claire pour un usage diurne

Pour changer de thème :
1. Ouvrez les Réglages (⚙️)
2. Section "Apparence"
3. Activez/désactivez le toggle "Thème clair"

## 🌍 Langues supportées

- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **English**
- 🇸🇦 **العربية** (avec support RTL automatique)

Pour changer de langue :
1. Ouvrez les Réglages (⚙️)
2. Section "Apparence"
3. Sélectionnez votre langue

## 🔧 Technologies utilisées

- **HTML5** : Structure sémantique
- **CSS3** : Styles avec variables CSS, thèmes, responsive design
- **JavaScript Vanilla** : Aucun framework, code pur JS
- **Service Worker** : Cache offline et stratégie "Cache First"
- **Web App Manifest** : Installation PWA
- **localStorage** : Stockage local des données
- **JSON** : Format d'import/export

## 📊 Gestion des données

### Stockage local

Toutes les données sont stockées dans le `localStorage` du navigateur sous la clé `revenir_state_v1`. Aucune donnée n'est envoyée à un serveur externe.

### Structure des données

Le state de l'application suit un schéma versionné (actuellement v3) :

```javascript
{
  schemaVersion: 3,
  profile: {
    lang: 'fr',
    religion: 'none',
    spiritualEnabled: false,
    rtl: false
  },
  settings: {
    discreetMode: false,
    notifications: false,
    lowTextMode: false,
    theme: 'dark'
  },
  addictions: [],
  checkins: [],
  events: [],
  // ... autres champs
}
```

### Import/Export

- **Export** : Génère un fichier JSON avec toutes vos données
- **Import** : Restaure vos données depuis un fichier JSON
- **Migration automatique** : Les anciennes versions sont automatiquement migrées vers le schéma actuel

## 🎯 Utilisation

### Premier lancement

1. Ouvrez l'application
2. Sélectionnez vos addictions à suivre
3. Configurez votre langue et préférences
4. Commencez votre premier check-in

### Navigation

- **🏠 Aujourd'hui** : Écran d'accueil avec actions rapides
- **🆘 Craving maintenant** : Protocole 90 secondes
- **📝 Check-in** : Check-in quotidien détaillé
- **⚙️ Réglages** : Configuration de l'application

### Menu Outils

Accédez au menu "Mes outils" depuis l'écran d'accueil pour :
- ⚠️ **Pente** : Protocole pente glissante
- 🌙 **Rituel** : Rituel du soir
- 📚 **Programmes** : Programmes guidés
- 📊 **Dashboard** : Vue d'ensemble
- 📝 **Journal** : Journal de bord
- 📅 **Calendrier** : Calendrier de sobriété
- 📊 **Heatmap** : Heatmap des risques
- 🧪 **Expériences** : Mode expérimentation
- ⚙️ **Config** : Configuration anti-porno

## 🔐 Confidentialité

- ✅ **100% Offline** : Aucune connexion Internet requise
- ✅ **Données locales** : Tout est stocké sur votre appareil
- ✅ **Pas de tracking** : Aucun analytics, aucune télémétrie
- ✅ **Pas de compte** : Aucune inscription nécessaire
- ✅ **Open Source** : Code source disponible et auditable

## 🛠️ Développement

### Prérequis

- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel, pour PWA)

### Architecture

L'application suit une architecture modulaire :

- **app.js** : Orchestration principale, rendu des écrans
- **router.js** : Navigation SPA basée sur hash
- **storage.js** : Abstraction localStorage + migrations
- **features/** : Modules indépendants par fonctionnalité
- **i18n.js** : Système de traduction centralisé

### Ajout d'une nouvelle fonctionnalité

1. Créez un nouveau fichier dans `features/`
2. Exportez vos fonctions via `window.NomModule = { ... }`
3. Ajoutez le script dans `index.html`
4. Intégrez dans `app.js` si nécessaire

## 📝 Version

**Version actuelle** : 3.0.0

### Historique des versions

- **v3.0.0** : Dashboard, thème clair, features avancées
- **v2.0.0** : Intentions, règles, victoires, rituels, heatmap
- **v1.0.0** : Version initiale avec check-in et protocole 90s

## 🤝 Contribution

Ce projet est open source. Les contributions sont les bienvenues !

## 📄 Licence

[À définir selon votre préférence]

## 🙏 Remerciements

Application développée avec une approche bienveillante et respectueuse de la vie privée, pour accompagner les personnes dans leur parcours de récupération.

---

**Note importante** : Cette application ne remplace pas un suivi médical ou thérapeutique professionnel. En cas de besoin, consultez un professionnel de santé.
