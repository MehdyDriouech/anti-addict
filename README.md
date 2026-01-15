# Haven - Application de Gestion des Addictions

> A steady point in the storm

Application web progressive (PWA) pour le suivi et la gestion des addictions, avec un focus sur la confidentialité et le fonctionnement hors-ligne.

## 📋 Description

**Haven** est une application web progressive (PWA) conçue pour aider à gérer et surmonter les addictions. L'application supporte **9 types d'addictions** (contenu adulte, cigarette, alcool, substances, réseaux sociaux, jeux vidéo, nourriture compulsive, achats compulsifs, jeu d'argent) et permet de suivre plusieurs addictions simultanément. L'application fonctionne entièrement hors-ligne, stocke toutes les données localement sur votre appareil, et ne nécessite aucune connexion Internet ni compte utilisateur.

### Caractéristiques principales

- 🔒 **100% Privé** : Toutes les données restent sur votre appareil
- 🔐 **Verrouillage par PIN** : Protection de vos données sensibles avec code PIN
- 🔑 **Chiffrement local** : Données sensibles chiffrées avec AES-GCM-256
- 💾 **IndexedDB** : Stockage robuste et performant pour grandes quantités de données
- 📱 **PWA** : Installable sur mobile et desktop
- 🌍 **Multi-langue** : Français, Anglais, Arabe (avec support RTL)
- 🌓 **Thèmes** : Mode clair et sombre
- 📊 **Dashboard** : Vue d'ensemble de vos données et insights
- 🧘 **Approche bienveillante** : Ton neutre, non culpabilisant
- ⚡ **Offline-first** : Fonctionne sans connexion Internet
- 🔄 **Multi-addictions** : Suivez plusieurs addictions simultanément avec sélection dynamique

## 🎯 Addictions supportées

L'application supporte actuellement **9 addictions** réparties en 3 catégories :

### Addictions numériques (Digital)
- 🔞 **Contenu adulte** (porn) - Risque élevé
- 📱 **Réseaux sociaux** (social_media) - Risque faible
- 🎮 **Jeux vidéo** (gaming) - Risque faible

### Addictions aux substances (Substance)
- 🚬 **Cigarette** - Risque moyen
- 🍷 **Alcool** - Risque moyen
- 💊 **Substances** (drugs) - Risque élevé

### Addictions comportementales (Behavior)
- 🍔 **Nourriture compulsive** (food) - Risque faible
- 🛒 **Achats compulsifs** (shopping) - Risque faible
- 🎰 **Jeu d'argent** (gambling) - Risque moyen/élevé

### Fonctionnalités multi-addictions

- **Sélection dynamique** : Changez d'addiction dans les modales sans les fermer
- **Dropdown intelligent** : Avec 3+ addictions, un dropdown remplace les chips pour une meilleure lisibilité
- **Compteurs séparés** : Chaque addiction a son propre compteur de pentes stoppées
- **Configuration par addiction** : Déclencheurs, signaux et règles personnalisables par addiction

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

#### Mes engagements
- Visualisation centralisée de tous les engagements
- Engagements depuis les programmes guidés (jours 14 et 30)
- Engagements depuis les intentions quotidiennes
- Affichage avec date, programme, et contenu de l'engagement

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

#### Features Anti-Addictions spécifiques
- **Pente glissante avancée** : Protocole en 3 étapes (Quitter/Eau/Mouvement) disponible pour toutes les addictions
- **Sélection d'addiction** : Changez d'addiction dans les modales "pente" et "craving" sans fermer la modale
- **Dropdown automatique** : Interface adaptative (chips pour 2 addictions, dropdown pour 3+)
- **Configuration par addiction** : Déclencheurs, signaux de pente et règles personnalisables
- **Plan Nuit** (AntiPorn) : Routine configurable avec checklist
- **Check-in rapide** (AntiPorn) : "Téléphone au lit ?"

### Fonctionnalités V3

#### Bibliothèque d'actions
- Actions prédéfinies (mouvement, calme, social, etc.)
- Actions personnalisées
- Favoris et actions aléatoires

#### Coaching local (V2 - Architecture adaptative)
- **Modes de coaching personnalisables** : Observer, Stabilité (par défaut), Guidé, Silencieux
- **Insights adaptatifs** : Stabilisant, Habit (ancrages), Transition, Rétrospectif, Préventif, Prescriptif
- **Ancrages et transitions** : Propositions d'ancres de routine et fermetures de moments à risque
- **Identification des corrélations** : Détection automatique des liens instabilité ↔ urgences
- **Suggestions de règles** : Basées sur vos patterns
- **Réduction progressive** : Le coaching s'adapte et réduit sa fréquence selon votre progression

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

## 🏗️ Architecture Plugins

L'application utilise une architecture **MVC (Model-View-Controller)** pour tous les plugins, garantissant une séparation claire des responsabilités et une maintenabilité optimale.

### Structure d'un plugin

Chaque plugin suit cette structure :

```
PluginName/
├── model/              # Logique métier pure
│   └── plugin-model.js
├── view/               # Génération HTML et manipulation DOM
│   └── plugin-view.js
├── controller/         # Orchestration Model/View
│   └── plugin-controller.js
├── data/               # Constantes, traductions, configurations
│   └── plugin-data.js
└── plugin.js           # Point d'entrée du plugin
```

### Principes de séparation

- **Model** : Logique métier, gestion des données, calculs. **PAS** de manipulation DOM.
- **View** : Génération HTML, manipulation DOM, événements UI. **PAS** de logique métier.
- **Controller** : Orchestration entre Model et View, gestion du cycle de vie.

### Plugins d'addictions

Tous les plugins d'addictions héritent de `AddictionBase` qui fournit :
- Modèle de base pour la gestion des pentes, cravings, épisodes
- Vue de base avec sélecteur d'addiction (chips ou dropdown)
- Contrôleur de base avec gestion du changement d'addiction

**Plugins disponibles** :
- `AntiPorn` - Contenu adulte (avec features spécifiques : Plan Nuit, Check-in téléphone)
- `AntiSmoke` - Cigarette
- `AntiAlcohol` - Alcool
- `AntiDrugs` - Substances
- `AntiSocialMedia` - Réseaux sociaux
- `AntiGaming` - Jeux vidéo
- `AntiFood` - Nourriture compulsive
- `AntiShopping` - Achats compulsifs
- `AntiGambling` - Jeu d'argent

### Plugins de fonctionnalités

**Plugins disponibles** :
- `Actions` - Bibliothèque d'actions (mouvement, calme, social, etc.)
- `Calendar` - Calendrier de sobriété (habit tracker)
- `Coaching` - Insights hebdomadaires automatiques
- `Evening` - Rituels du soir avec checklist
- `Experiments` - Mode expérimentation et A/B testing
- `Heatmap` - Visualisation des moments à risque
- `IfThen` - Règles "Si... Alors..." personnalisables
- `Intentions` - Intentions quotidiennes générées
- `Journal` - Journal de bord avec tags
- `Programs` - Programmes guidés (14 et 30 jours)
- `Relapse` - Mode accompagnement après épisode
- `SOS` - Écran SOS avancé avec mode Low-Text
- `Spiritual` - Features spirituelles (playlists, compteurs)
- `Wins` - Victoires invisibles et temps gagné

### Plugin de base

- `AddictionBase` - Code partagé pour toutes les addictions (modèle, vue, contrôleur de base)

## 🎛️ Features Core

Les features core dans `app/core/features/` gèrent les fonctionnalités principales de l'application :

### Features disponibles

- **Checkin** : Check-in quotidien avec suivi de l'humeur, stress, envies, solitude
- **Commitments** : Modale "Mes engagements" pour visualiser tous les engagements pris dans les programmes et intentions
- **Craving** : Protocole 90 secondes / Urgence tentation avec exercices de respiration guidés
- **Dashboard** : Vue d'ensemble centralisée avec widgets et insights
- **History** : Historique des événements et check-ins
- **Home** : Écran d'accueil avec actions rapides et statistiques
- **Init** : Initialisation de l'application et migration des données
- **Onboarding** : Première configuration (sélection d'addictions, langue, préférences)
- **Settings** : Réglages de l'application (thème, langue, notifications, mode de coaching, etc.)
- **Tools** : Menu outils avec accès rapide à toutes les fonctionnalités
- **UI** : Composants UI réutilisables (modales, toasts, etc.)

### Architecture MVC

Chaque feature core suit également l'architecture MVC :
- `model/` - Logique métier
- `view/` - Rendu HTML
- `controller/` - Orchestration
- `data/` - Données et traductions

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
│   ├── core/
│   │   ├── app.js              # Orchestration principale
│   │   ├── router.js           # Navigation SPA
│   │   ├── storage.js          # Gestion IndexedDB/localStorage + migrations
│   │   ├── store.js            # API centralisée Store.update()
│   │   ├── analytics.js        # AnalyticsService pour insights
│   │   ├── security.js         # SecurityService (chiffrement, PIN)
│   │   ├── lock.js             # Gestion verrouillage/déverrouillage
│   │   ├── i18n.js             # Internationalisation
│   │   ├── utils.js            # Utilitaires (dates, stats)
│   │   ├── styles.css          # Styles globaux + thèmes
│   │   ├── storage/            # Drivers de stockage (IndexedDB, localStorage)
│   │   ├── security/           # Services de sécurité
│   │   └── features/           # Features core (MVC)
│   │       ├── Checkin/        # Check-in quotidien
│   │       ├── Commitments/    # Mes engagements
│   │       ├── Craving/        # Protocole 90 secondes
│   │       ├── Dashboard/      # Vue d'ensemble
│   │       ├── History/        # Historique
│   │       ├── Home/           # Écran d'accueil
│   │       ├── Init/          # Initialisation
│   │       ├── Onboarding/     # Première configuration
│   │       ├── Settings/       # Réglages
│   │       ├── Tools/          # Menu outils
│   │       └── UI/             # Composants UI
│   ├── data/
│   │   ├── addictions-config.js # Configuration des addictions
│   │   ├── texts/              # Fichiers de traduction
│   │   │   ├── strings.*.json  # Traductions UI
│   │   │   ├── programs_*.json # Contenu programmes guidés
│   │   │   └── spiritual_*.json # Cartes spirituelles
│   │   └── pictures/           # Images et icônes
│   └── plugins/                # Plugins MVC (architecture modulaire)
│       ├── AddictionBase/      # Base partagée pour toutes les addictions
│       ├── AntiPorn/           # Plugin contenu adulte
│       ├── AntiSmoke/          # Plugin cigarette
│       ├── AntiAlcohol/        # Plugin alcool
│       ├── AntiDrugs/          # Plugin substances
│       ├── AntiSocialMedia/    # Plugin réseaux sociaux
│       ├── AntiGaming/         # Plugin jeux vidéo
│       ├── AntiFood/           # Plugin nourriture compulsive
│       ├── AntiShopping/       # Plugin achats compulsifs
│       ├── AntiGambling/       # Plugin jeu d'argent
│       ├── Actions/            # Bibliothèque d'actions
│       ├── Calendar/           # Calendrier de sobriété
│       ├── Coaching/           # Coaching local
│       ├── Evening/            # Rituels du soir
│       ├── Experiments/        # Mode expérimentation
│       ├── Heatmap/            # Heatmap des risques
│       ├── IfThen/             # Règles "si... alors..."
│       ├── Intentions/          # Intentions quotidiennes
│       ├── Journal/            # Journal de bord
│       ├── Programs/           # Programmes guidés
│       ├── Relapse/            # Mode après rechute
│       ├── SOS/                # SOS avancé
│       ├── Spiritual/          # Features spirituelles
│       └── Wins/               # Victoires invisibles
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
- **JavaScript Vanilla (ES6 Modules)** : Aucun framework, code pur JS
- **Service Worker** : Cache offline et stratégie "Cache First"
- **Web App Manifest** : Installation PWA
- **IndexedDB** : Stockage local robuste et performant
- **localStorage** : Fallback pour compatibilité
- **Web Crypto API** : Chiffrement AES-GCM-256 et dérivation PBKDF2
- **JSON** : Format d'import/export

## 📊 Gestion des données

### Stockage local

L'application utilise **IndexedDB** comme système de stockage principal pour une meilleure performance et capacité. Les données sont automatiquement migrées depuis `localStorage` si nécessaire. Aucune donnée n'est envoyée à un serveur externe.

### Sécurité et chiffrement

- **Verrouillage par PIN** : Protégez vos données sensibles avec un code PIN
- **Chiffrement AES-GCM-256** : Les données sensibles (événements, journal, etc.) sont chiffrées au repos
- **Clé dérivée PBKDF2** : Le PIN est transformé en clé de chiffrement (jamais stocké en clair)
- **Mode verrouillé** : Accès restreint aux fonctionnalités d'urgence uniquement
- **Déverrouillage** : Accès complet après saisie du PIN

### Structure des données

Le state de l'application suit un schéma versionné (actuellement v5) :

```javascript
{
  schemaVersion: 5,
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
    theme: 'dark',
    pinEnabled: false // Verrouillage par PIN
  },
  addictions: [],
  checkins: [],
  events: [], // Chiffré si PIN activé
  // ... autres champs
}
```

### Import/Export

- **Export** : Génère un fichier JSON avec toutes vos données
- **Import** : Restaure vos données depuis un fichier JSON
- **Migration automatique** : Les anciennes versions sont automatiquement migrées vers le schéma actuel
- **Migration IndexedDB** : Migration automatique depuis localStorage vers IndexedDB

## 🎯 Utilisation

### Premier lancement

1. Ouvrez l'application
2. Sélectionnez vos addictions à suivre
3. Configurez votre langue et préférences
4. Commencez votre premier check-in

### Navigation

- **🏠 Aujourd'hui** : Écran d'accueil avec actions rapides
- **🆘 Craving maintenant** : Protocole 90 secondes (accessible même verrouillé)
- **🆘 SOS** : Mode SOS avancé (accessible même verrouillé)
- **📝 Check-in** : Check-in quotidien détaillé
- **⚙️ Réglages** : Configuration de l'application (verrouillage PIN, thème, langue, etc.)
- **🔒 Verrouillage** : Icône de verrouillage dans le header pour verrouiller/déverrouiller rapidement

### Verrouillage par PIN

L'application peut être verrouillée avec un code PIN pour protéger vos données sensibles :

1. **Définir un PIN** : 
   - Lors de l'onboarding (optionnel)
   - Ou dans les Réglages → Sécurité → "Définir un code PIN"

2. **Verrouiller l'application** :
   - Cliquez sur l'icône 🔒 dans le header
   - L'application affichera une vue verrouillée avec uniquement les fonctionnalités d'urgence accessibles

3. **Déverrouiller** :
   - Cliquez sur l'icône 🔓 dans le header
   - Entrez votre code PIN
   - Accès complet restauré

**Note** : Les fonctionnalités d'urgence (Urgence Tentation et SOS) restent accessibles même lorsque l'application est verrouillée.

### Menu Outils

Accédez au menu "🧰 Mes outils" depuis l'écran d'accueil pour :

#### 🚨 Section URGENCE
- ⚠️ **Pente** : Protocole pente glissante (disponible pour toutes les addictions)

#### 💜 Section ACCOMPAGNEMENT
- 💪 **Mes engagements** : Visualisation de tous vos engagements
- 🌙 **Rituel** : Rituel du soir avec checklist personnalisable
- 📚 **Programmes** : Programmes guidés (14 et 30 jours)
- 🤲 **Spirituel** : Features spirituelles (si activé)

#### 📈 Section SUIVI
- 📊 **Dashboard** : Vue d'ensemble avec widgets et insights
- 📝 **Journal** : Journal de bord avec tags et recherche
- 📅 **Calendrier** : Calendrier de sobriété (habit tracker)
- 📊 **Heatmap** : Heatmap des risques et patterns
- 🧪 **Expériences** : Mode expérimentation et A/B testing

#### ⚙️ Section CONFIG
- ⚙️ **Config** : Configuration de l'addiction actuelle (déclencheurs, règles)

## 🔐 Confidentialité et Sécurité

- ✅ **100% Offline** : Aucune connexion Internet requise
- ✅ **Données locales** : Tout est stocké sur votre appareil (IndexedDB)
- ✅ **Chiffrement local** : Données sensibles chiffrées avec AES-GCM-256
- ✅ **Verrouillage par PIN** : Protection supplémentaire de vos données
- ✅ **Pas de tracking** : Aucun analytics, aucune télémétrie
- ✅ **Pas de compte** : Aucune inscription nécessaire
- ✅ **Open Source** : Code source disponible et auditable
- ✅ **Lazy Crypto** : Chiffrement/déchiffrement à la demande pour performance optimale

## 🛠️ Développement

### Prérequis

- Navigateur moderne (Chrome, Firefox, Safari, Edge)
- Serveur web local (optionnel, pour PWA)
- Support des modules ES6

### Architecture

L'application suit une architecture **modulaire MVC** :

- **core/app.js** : Orchestration principale, rendu des écrans, filtre console
- **core/router.js** : Navigation SPA basée sur hash avec protection des routes
- **core/storage.js** : Abstraction stockage (IndexedDB/localStorage) + migrations
- **core/store.js** : API centralisée Store.update() pour cohérence des données
- **core/analytics.js** : AnalyticsService pour insights locaux et agrégations
- **core/security.js** : SecurityService pour chiffrement et gestion PIN
- **core/lock.js** : Gestion du verrouillage/déverrouillage de l'application
- **core/features/** : Features core avec architecture MVC
- **plugins/** : Plugins modulaires avec architecture MVC
- **core/i18n.js** : Système de traduction centralisé
- **core/storage/** : Drivers de stockage (IndexedDBDriver, LocalStorageDriver)
- **core/security/** : Services de sécurité (chiffrement, dérivation de clés)

### Créer un nouveau plugin

1. **Créer la structure** dans `app/plugins/NomPlugin/` :
   ```
   NomPlugin/
   ├── model/
   │   └── nom-plugin-model.js
   ├── view/
   │   └── nom-plugin-view.js
   ├── controller/
   │   └── nom-plugin-controller.js
   ├── data/
   │   └── nom-plugin-data.js
   └── nom-plugin.js
   ```

2. **Implémenter le Model** : Logique métier pure, gestion des données
3. **Implémenter la View** : Génération HTML, manipulation DOM
4. **Implémenter le Controller** : Orchestration Model/View
5. **Créer le point d'entrée** : `nom-plugin.js` qui exporte l'objet global
6. **Ajouter dans `index.html`** : `<script type="module" src="plugins/NomPlugin/nom-plugin.js"></script>`

### Ajouter une nouvelle addiction

1. **Ajouter dans `data/addictions-config.js`** :
   - Définir la configuration (triggers, slopeSignals, replacementActions)
   - Spécifier le groupe (digital, substance, behavior) et le niveau de risque

2. **Créer le plugin** dans `app/plugins/AntiNom/` :
   - Hériter de `AddictionBase` pour le modèle et la vue
   - Personnaliser les signaux de pente et les étapes dans `data/`
   - Ajouter des features spécifiques si nécessaire

3. **Ajouter les traductions** dans `data/texts/strings.*.json` :
   - `addiction_nom` : Nom de l'addiction
   - Labels spécifiques si nécessaire

4. **Ajouter dans `index.html`** : Charger le plugin après `AddictionBase`

### Créer une nouvelle feature core

1. **Créer la structure** dans `app/core/features/NomFeature/` :
   ```
   NomFeature/
   ├── model/
   │   └── nom-feature-model.js
   ├── view/
   │   └── nom-feature-view.js
   ├── controller/
   │   └── nom-feature-controller.js
   ├── data/
   │   └── nom-feature-data.js
   └── nom-feature.js
   ```

2. **Suivre l'architecture MVC** comme pour les plugins
3. **Intégrer dans `core/app.js`** si nécessaire pour la navigation

### Structure des données

Le state de l'application est versionné et migré automatiquement. Structure actuelle (v6) :

```javascript
{
  schemaVersion: 6,
  profile: { lang, religion, spiritualEnabled, rtl },
  settings: { discreetMode, notifications, lowTextMode, theme },
  addictions: [], // Liste des addictions actives
  addictionConfigs: {}, // Configuration par addiction
  checkins: [], // Check-ins quotidiens
  events: [], // Événements (cravings, episodes, wins, slopes)
  coaching: {
    mode: 'stability', // 'observer' | 'stability' | 'guided' | 'silent'
    lastShownDate: null,
    activeAnchor: null, // Ancrage actif (habitude en cours)
    insights: [], // Historique des insights
    feedback: { useful: 0, dismissed: 0 }
  },
  // ... autres données spécifiques aux plugins
}
```

## 📝 Version

**Version actuelle** : 0.3.6

### Historique des versions

- **v0.3.6** :
  - Coaching V2 - Architecture de stabilité adaptative
  - Modes de coaching personnalisables (Observer, Stabilité, Guidé, Silencieux)
  - Insights adaptatifs : Stabilisant, Habit, Transition, Rétrospectif, Préventif, Prescriptif
  - Gestion des ancrages actifs (un seul à la fois)
  - Réduction progressive de la fréquence du coaching
  - Migration automatique v5→v6 pour le modèle coaching

- **v0.3.5** : 
  - Migration vers IndexedDB pour stockage robuste
  - Système de verrouillage par PIN
  - Chiffrement AES-GCM-256 des données sensibles
  - API centralisée Store.update() pour cohérence des données
  - AnalyticsService pour insights locaux
  - Vue verrouillée avec accès aux fonctionnalités d'urgence uniquement
  - Filtre console pour erreurs d'extensions navigateur

- **v0.3.1** : 
  - Architecture de stockage avec StorageDriver pattern
  - Support IndexedDB et localStorage
  - Migration automatique des données

- **v0.3.0** : 
  - Support multi-addictions complet (8 addictions)
  - Sélection d'addiction dans les modales (pente, craving)
  - Dropdown automatique pour 3+ addictions
  - Architecture MVC pour tous les plugins
  - Amélioration de l'interface utilisateur

- **v3.0.0** : Dashboard, thème clair, features avancées, architecture plugins MVC

- **v0.2.0** : Intentions, règles, victoires, rituels, heatmap

- **v0.1.0** : Version initiale avec check-in et protocole 90s

## 🤝 Contribution

Ce projet est open source. Les contributions sont les bienvenues !

## 📄 Licence

[À définir selon votre préférence]

## 🙏 Remerciements

Application développée avec une approche bienveillante et respectueuse de la vie privée, pour accompagner les personnes dans leur parcours de récupération.

---

**Note importante** : Cette application ne remplace pas un suivi médical ou thérapeutique professionnel. En cas de besoin, consultez un professionnel de santé.
