# Coaching V2 - Architecture de stabilité adaptative

## Vue d'ensemble

Le Coaching V2 est un système adaptatif qui permet à l'utilisateur de choisir son style d'accompagnement. Il favorise la stabilité de vie en proposant des ancrages, des transitions et un rythme adapté, tout en réduisant progressivement sa présence.

## Philosophie

Haven n'est pas un compagnon permanent. C'est un refuge qui doit savoir se taire. Le coaching aide à construire une vie plus stable et vise explicitement l'obsolescence de l'application.

## Modes de coaching

### Observer
- **Fréquence** : Très faible (max 1/semaine)
- **Interventions** : Peu, surtout rétrospectives
- **Types d'insights** : `retrospective`, `stabilizing`
- **Affichage** : Icône seule sur Home (discret)
- **Idéal pour** : Utilisateurs autonomes

### Stability (par défaut)
- **Fréquence** : Faible (max 1/3 jours)
- **Interventions** : Ancrages et transitions prioritaires
- **Types d'insights** : `stabilizing`, `habit`, `transition`, `retrospective`
- **Règle** : Un seul ancrage actif à la fois
- **Affichage** : Normal mais discret
- **Idéal pour** : Utilisateurs cherchant de la structure

### Guided
- **Fréquence** : Modérée (max 1/jour)
- **Interventions** : Plus de feedback et propositions
- **Types d'insights** : Tous sauf `prescriptive` (avec priorité modérée)
- **Explications** : Légèrement plus détaillées
- **Affichage** : Normal
- **Idéal pour** : Utilisateurs souhaitant un accompagnement plus présent

### Silent
- **Fréquence** : Exceptionnelle (max 1/14 jours, seuil strict)
- **Interventions** : Quasi invisibles
- **Types d'insights** : Uniquement `stabilizing` avec forte instabilité (instabilityScore >= 2 et cravings >= 5)
- **Affichage** : Aucun widget sur Home
- **Idéal pour** : Utilisateurs avancés ou période de réduction

## Architecture

### Structure MVC

```
Coaching/
├── model/coaching-model.js       # Logique métier (génération, sélection)
├── view/coaching-view.js          # Rendu HTML (modal, widget)
├── controller/coaching-controller.js  # Orchestration
├── data/coaching-data.js          # Constantes (modes, traductions)
└── coaching.js                    # Point d'entrée
```

### Modèle de données

```javascript
coaching: {
  mode: 'stability',              // Mode actif
  lastShownDate: string | null,   // Dernière date d'affichage
  activeAnchor: {                 // Ancrage actif (si habitude)
    id: string,
    type: 'anchor' | 'transition',
    context: 'morning' | 'day' | 'evening',
    addictionId?: string,
    suggestedAt: string
  } | null,
  insights: [],                   // Historique des insights
  feedback: {
    useful: number,               // Compteur utile
    dismissed: number             // Compteur rejeté
  }
}
```

### Types d'insights

Priorité décroissante :
1. **stabilizing** : Lien instabilité ↔ urgences
2. **habit** : Proposition d'ancrage (routine)
3. **transition** : Fermeture d'un moment à risque
4. **retrospective** : Rétrospective de la semaine
5. **preventive** : Prévention basée sur patterns
6. **prescriptive** : Actions suggérées (modes guided uniquement)

## Règles de génération

### Fréquence par mode

- **silent** : Max 1/14 jours + seuil strict d'instabilité
- **observer** : Max 1/semaine
- **stability** : Max 1/3 jours
- **guided** : Max 1/jour

### Règles communes

- ❌ Ne jamais générer pendant une urgence active
- ❌ Ne jamais générer pendant le cooldown post-urgence (5 min)
- ✅ Un seul ancrage actif à la fois (modes stability/guided)
- ✅ Ne pas proposer de nouvel ancrage si activeAnchor < 7 jours

## Exemples d'usage

### Changer de mode

```javascript
// Via l'API Coaching
await Coaching.changeCoachingMode(state, 'silent');

// Via Settings
Settings.openCoachingModeModal(state);
```

### Générer un insight

```javascript
// Génération automatique (lazy) lors de l'ouverture
await Coaching.openCoaching(state);

// Vérifier si peut générer
const canGenerate = model.shouldGenerateInsight(state);
```

### Vérifier le widget Home

```javascript
// Le widget s'adapte automatiquement au mode
const widgetHTML = Coaching.renderWidget(state);
// Retourne '' si mode silent
// Retourne icône seule si mode observer
// Retourne widget normal si stability/guided
```

## Migration

La migration v5→v6 ajoute automatiquement :
- `coaching.mode = 'stability'` (par défaut)
- `coaching.activeAnchor = null`
- Renommage `feedback.usefulCount` → `feedback.useful`
- Renommage `feedback.dismissedCount` → `feedback.dismissed`

## Tests

Voir `tests/coaching-model.test.js` et `tests/coaching-integration.test.js` pour :
- Sélection d'insight par mode
- Respect des règles de fréquence
- Gestion activeAnchor
- Changement de mode sans perte de données
- Pas d'insight pendant urgence
- Mode silent invisible sur Home

## Interdictions absolues

- ❌ Aucun backend
- ❌ Aucune IA distante
- ❌ Aucun dark pattern
- ❌ Aucun langage culpabilisant
- ❌ Aucun usage de `state.events` bruts (analytics summaries only)

## Philosophie à respecter

Le coaching est un architecte de stabilité quotidienne. Il favorise les ancrages, les transitions et le rythme. Il n'est pas prescriptif ni thérapeutique. Il doit savoir se taire.
