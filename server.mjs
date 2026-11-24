import express from "express";
import { Mistral } from "@mistralai/mistralai";
import { besoins, cahierDeSuivi } from "./data/besoins.mjs";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const apiKey = process.env.MISTRAL_API_KEY;
const client = apiKey ? new Mistral({ apiKey }) : null;

const SYSTEM_PROMPT = `Tu es un formateur expert en ADVF (Assistant de Vie aux Familles), diplôme équivalent au Bac+2 ASSP/ADVF.
Tu aides des élèves à réviser le référentiel ADVF.

Cadre d'analyse à utiliser systématiquement :
- Les 14 besoins fondamentaux de Virginia Henderson : respirer, boire/manger, éliminer, se mouvoir/maintenir une bonne posture, dormir/se reposer, se vêtir/se dévêtir, maintenir la température du corps, être propre/protéger ses téguments, éviter les dangers, communiquer, agir selon ses croyances et valeurs, s'occuper en vue de se réaliser, se divertir, apprendre.
- La méthode du cahier de suivi (cahier de transmissions) : observer objectivement, noter (daté, signé, factuel), analyser (relier chaque observation aux 14 besoins pour identifier ceux qui sont perturbés ou risqués), agir dans le champ de compétences de l'ADVF (faire avec, jamais à la place), transmettre à la famille/équipe, réévaluer.

Règles de réponse :
- Réponds toujours en français, clair et pédagogique.
- Quand tu expliques une situation, identifie les besoins de Henderson perturbés, les signes observables, et les actions dans le champ de compétences de l'ADVF.
- Sur demande (« fiche sur... »), produis une fiche mémo structurée : Définition / Signes d'un besoin perturbé / Actions de l'ADVF / Point de vigilance.
- Reste dans le domaine ADVF : aide à domicile, famille, enfants, personnes âgées ou dépendantes, entretien du domicile et du linge, préparation des repas, assistants de vie.`;

app.get("/api/besoins", (req, res) => {
  res.json({ besoins, cahierDeSuivi });
});

app.post("/api/chat", async (req, res) => {
  if (!client) {
    return res.status(500).json({
      error: "Clé API manquante. Définissez MISTRAL_API_KEY côté serveur (fichier .env ou variable d'environnement)."
    });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Corps de requête invalide : 'messages' (tableau) requis." });
  }

  const history = messages.slice(-20).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 8000)
  })).filter((m) => m.content.trim().length > 0);

  if (history.length === 0) {
    return res.status(400).json({ error: "Messages vides." });
  }

  try {
    const result = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history]
    });
    const reply = result.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "Réponse vide de l'API Mistral." });
    }
    res.json({ reply });
  } catch (err) {
    console.error("Erreur API Mistral:", err?.message || err);
    res.status(502).json({ error: "Erreur lors de l'appel à l'API Mistral : " + (err?.message || "inconnue") });
  }
});

app.listen(port, () => {
  console.log(`App révision ADVF : http://localhost:${port}`);
  console.log(apiKey ? "MISTRAL_API_KEY : chargée." : "ATTENTION : MISTRAL_API_KEY absente, le chat ne fonctionnera pas.");
});
