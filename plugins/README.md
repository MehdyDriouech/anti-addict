# Architecture Plugins MVC

Cette architecture respecte les principes SOLID et sépare les responsabilités selon le pattern MVC.

## Structure

Chaque plugin est organisé dans un dossier avec 4 sous-dossiers :

```
plugins/
├── [PluginName]/
│   ├── model/          # Logique métier pure
│   ├── view/           # Génération HTML et manipulation DOM
│   ├── controller/     # Orchestration Model/View
│   ├── data/           # Constantes, traductions, configurations
│   └── [plugin].js     # Point d'entrée du plugin
```

## Principes de séparation

### Model
- Logique métier pure
- Gestion des données (lecture/écriture via Storage)
- Calculs et algorithmes
- **PAS** de manipulation DOM
- Exports de classes/fonctions réutilisables

### View
- Génération de HTML
- Manipulation DOM (création, mise à jour d'éléments)
- Gestion des événements UI (clics, inputs)
- Styles et classes CSS
- **PAS** de logique métier

### Controller
- Orchestration entre Model et View
- Gestion du cycle de vie du plugin
- Écoute des événements utilisateur
- Appels aux méthodes du Model
- Appels aux méthodes de la View
- Point d'entrée principal du plugin

### Data
- Fichiers JSON de configuration
- Traductions spécifiques au plugin (si nécessaire)
- Constantes et données statiques
- Templates HTML (si nécessaire)

## Plugins migrés

✅ **SOS** - Architecture MVC complète
✅ **Wins** - Architecture MVC complète
✅ **Intentions** - Architecture MVC complète

## Plugins à migrer

Les plugins suivants sont encore dans `app/features/` et doivent être migrés progressivement :

- Calendar
- Coaching
- Actions
- Programs
- Journal
- Spiritual
- IfThen
- Relapse
- Evening
- AntiPorn
- Heatmap
- Experiments

## Exemple d'utilisation

```javascript
// plugins/SOS/sos.js (point d'entrée)
import { SOSModel } from './model/sos-model.js';
import { SOSView } from './view/sos-view.js';
import { SOSController } from './controller/sos-controller.js';

const sosModel = new SOSModel();
const sosView = new SOSView();
const sosController = new SOSController(sosModel, sosView);

window.SOS = sosController;
export default sosController;
```

## Dépendances

Les plugins peuvent dépendre d'autres plugins via :
- **Imports ES6** : Pour les plugins migrés (ex: `import { Actions } from '../Actions/actions.js'`)
- **Globals** : Pour les plugins non migrés (ex: `window.Actions`)

## Migration d'une feature

1. Créer la structure de dossiers dans `plugins/[FeatureName]/`
2. Séparer le code en Model, View, Controller, Data
3. Créer le point d'entrée `[feature].js`
4. Mettre à jour `index.html` pour charger le nouveau plugin
5. Tester la fonctionnalité
6. Supprimer l'ancien fichier dans `features/`
