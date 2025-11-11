const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

let buzzerEnabled = true;


router.get('/', (req, res) => {
  res.json({ enabled: buzzerEnabled });
});

router.post('/', async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Formato inválido. Esperado: { enabled: boolean }' });
    }

    buzzerEnabled = enabled;
    console.log(`🔔 Buzzer agora está ${enabled ? 'ATIVO' : 'SILENCIADO'}`);

    // 🔸 Envia pro ESP32 (IP fixo configurado)
    const ESP_IP = 'http://10.159.24.47'; // altere se necessário
    await fetch(`${ESP_IP}/api/sensor/silent?silent=${enabled}`, { method: 'POST' });

    return res.json({ message: 'Estado do buzzer atualizado', enabled });
  } catch (error) {
    console.error('Erro ao atualizar buzzer:', error);
    return res.status(500).json({ error: 'Falha ao comunicar com ESP32' });
  }
});

module.exports = router;
