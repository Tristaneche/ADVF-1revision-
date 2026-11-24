# Révision ADVF — Fiches mémo & Chat (API Mistral)

Application web minimale pour réviser le diplôme **ADVF (Assistant de Vie aux Familles)** : fiches mémo sur les **14 besoins fondamentaux de Henderson** et la **méthode du cahier de suivi**, plus un chat de révision alimenté par `mistral-small-latest` via le SDK TypeScript officiel.

## Fonctionnalités

- 📒 **Fiches mémo** : 14 cartes à retourner (recto = besoin, verso = définition, signes, actions en ADVF) + résumé de la méthode du cahier de suivi (observer → noter → analyser → agir → transmettre → réévaluer).
- 💬 **Chat de révision** : questions-réponses avec un formateur virtuel expert ADVF, qui identifie systématiquement les besoins de Henderson perturbés et les actions dans le champ de compétences de l'ADVF.
- 🔒 **Sécurité** : `MISTRAL_API_KEY` n'est jamais envoyée au navigateur — tous les appels à l'API passent par le serveur.

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine (ou exportez la variable d'environnement) :

```
MISTRAL_API_KEY=votre_cle_api_mistral
```

La clé s'obtient sur [console.mistral.ai](https://console.mistral.ai/). Le fichier `.env` est ignoré par git — ne le partagez jamais.

## Lancement

```bash
npm start        # production
npm run dev      # développement (rechargement automatique)
```

Puis ouvrez [http://localhost:3000](http://localhost:3000).

Option : changez le port avec `PORT=8080 npm start`.

## Structure

```
advf-revision/
├── server.mjs          # Serveur Express : routes /api/chat et /api/besoins (la clé reste ici)
├── data/besoins.mjs    # Les 14 besoins de Henderson adaptés à l'ADVF + méthode du cahier de suivi
└── public/
    └── index.html      # Interface : onglet Chat + onglet Fiches mémo
```
