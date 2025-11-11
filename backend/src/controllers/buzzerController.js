// backend/routes/buzzer.js
import express from "express";
const router = express.Router();

let buzzerEnabled = true;

// 🔹 GET estado do buzzer
router.get("/", (req, res) => {
  res.json({ enabled: buzzerEnabled });
});

// 🔹 POST atualizar estado
router.post("/", (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled === "boolean") {
    buzzerEnabled = enabled;
    console.log(`🔔 Buzzer agora está ${enabled ? "ATIVO" : "SILENCIADO"}`);
    return res.json({ message: "Estado do buzzer atualizado", enabled });
  }
  res.status(400).json({ message: "Formato inválido" });
});

export default router;