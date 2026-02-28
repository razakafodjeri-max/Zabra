# STUDYFLOW — Assistant de Concentration Pomodoro Intelligent

STUDYFLOW est une application desktop intelligente qui utilise l'IA pour optimiser votre concentration en temps réel.

[Consulter la DOCUMENTATION COMPLÈTE ici](./DOCS.md)

## 🚀 Fonctionnalités

- **Pomodoro Adaptatif** : Le minuteur s'adapte à votre niveau d'attention.
- **Détection par IA** : Analyse locale (webcam) pour détecter la concentration, la distraction ou l'absence.
- **Dashboard Premium** : Suivez vos progrès avec des graphiques élégants.
- **Gestion de Tâches** : Organisez vos objectifs de session.
- **Confidentialité** : Traitement IA 100% local, aucune image n'est stockée.

## 🛠️ Utilisation Rapide (Windows)

- **Double-cliquez** sur `STUDYFLOW.bat` pour lancer l'application normalement.
- **Double-cliquez** sur `STUDYFLOW-hidden.bat` pour lancer l'application directement dans la barre des tâches.

## 🛠️ Installation (Développeur)
2. **Installation** :
   ```bash
   npm install
   ```
3. **Lancement (Dev)** :
   ```bash
   npm run dev
   ```
4. **Build (Packaging)** :
   ```bash
   npm run build
   ```

## 🏗️ Architecture

- **Electron.js** : Cœur de l'application desktop.
- **React + Vite** : Interface utilisateur rapide et moderne.
- **TensorFlow.js** : Moteur d'IA pour la détection faciale.
- **SQLite** : Persistance locale des données.
- **Zustand** : Gestion d'état globale.

## 🔒 Confidentialité

STUDYFLOW respecte votre vie privée. L'indicateur de webcam s'allume uniquement pendant les sessions de focus, et aucun flux vidéo n'est envoyé sur internet ou stocké sur votre disque.
>>>>>>> 525511f (Initial commit: STUDYFLOW full version with AI & Stats Sync)
