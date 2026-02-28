# Documentation STUDYFLOW 🚀

Bienvenue dans la documentation complète de **STUDYFLOW**, votre assistant de concentration intelligent.

---

## 📖 Guide de l'Utilisateur

### 1. Le Chronomètre (Focus)
- **Durée Personnalisable** : Réglez votre session entre **5 min** et **60 min** dans les paramètres.
- **Pomodoro Adaptatif** : Si l'IA est activée, le temps restant s'ajuste dynamiquement selon votre état de concentration.
- **Bouton Pause stable** : Vous pouvez mettre en pause à tout moment sans perdre votre progression.

### 2. Gestion des Objectifs (Tasks)
- **Focus Actif** : Cliquez sur une tâche pour la définir comme votre objectif actuel. Elle sera mise en avant (effet brillant).
- **Progression Auto** : À la fin de chaque session de travail, le compteur de "Pomodoros" de la tâche sélectionnée augmente automatiquement.

### 3. Profils et Statistiques
- **Multi-Profils** : Créez des profils différents (ex: Travail, Étude, Loisir). Chaque profil a ses propres tâches et réglages.
- **Tableau de Bord** : Visualisez vos tendances hebdomadaires et votre score de focus moyen. Les données s'actualisent instantanément à chaque fin de session.

---

## 🛠️ Architecture Technique

### Frontend (React + Vite)
- **UI** : Design moderne avec effets de verre (glassmorphism) et animations fluides.
- **Store (Zustand)** : Gestion d'état centralisée dans `src/store/useStore.ts`. Réactivité totale entre les pages.

### Backend (Electron + SQLite)
- **Main Process** : Gère les fenêtres et l'accès au matériel (webcam).
- **Base de Données** : Persistance via SQLite (`electron/database.ts`).
- **Hardware Bypass** : Utilise un mécanisme de capture léger pour éviter les conflits de ressources matérielles sur Windows.

### Intelligence Artificielle
- **Modèle** : Utilise TensorFlow.js avec le modèle `BlazeFace`.
- **Analyse** : Détecte 3 états :
  - **Concentré** : Visage stable et de face.
  - **Distrait** : Visage détourné ou incliné.
  - **Absent** : Aucun visage détecté.

---

## 🔧 Maintenance et Dépannage

- **Webcam Bloquée ?** : L'application utilise désormais un mode de compatibilité Windows. Si la caméra ne s'allume pas, fermez toutes les autres applications utilisant la webcam et redémarrez STUDYFLOW.
- **Reset des Données** : Les données sont stockées localement dans le dossier `userData` de l'application.

---

*Documentation mise à jour le 28 Février 2026.*
