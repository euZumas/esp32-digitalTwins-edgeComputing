const fetch = require('node-fetch');   // Certifique-se de que foi “npm install node-fetch”

/** Estado atual do buzzer (true = ativo, false = silenciado) */
let buzzerEnabled = true;

/** Retorna o estado atual do buzzer */
const getBuzzerState = (req, res) => {
  res.json({ enabled: buzzerEnabled });
};

/** Atualiza o estado do buzzer e envia comando ao ESP32 */
const setBuzzerState = async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Formato inválido. Esperado { enabled: boolean }' });
    }

    buzzerEnabled = enabled;
    console.log(`🔔 Buzzer agora está ${enabled ? 'ATIVO' : 'SILENCIADO'}`);

    const ESP_IP = process.env.ESP_IP || 'http://10.224.72.146:3000';
    const silent = !enabled;
    const url = `${ESP_IP}/api/sensor/silent?silent=${silent}`;

    console.log(`➡️ Enviando comando para ESP32: ${url}`);

    const response = await fetch(url, {
      method: 'POST'
      // Se seu ESP32 espera headers ou body JSON, adicione aqui:
      // headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({ silent })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Resposta inválida do ESP32:", response.status, text);
      throw new Error(`ESP32 respondeu com status ${response.status}`);
    }

    return res.json({ message: 'Estado do buzzer atualizado', enabled });
  } catch (error) {
    console.error('❌ Erro ao atualizar buzzer:', error.message);
    return res.status(500).json({ error: 'Falha ao comunicar com ESP32', detail: error.message });
  }
};

module.exports = {
  getBuzzerState,
  setBuzzerState
};
