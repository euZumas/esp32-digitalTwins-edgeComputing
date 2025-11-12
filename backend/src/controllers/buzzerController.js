/** Estado atual do buzzer (true = ativo, false = silenciado) */
let buzzerEnabled = true;

const getBuzzerState = (req, res) => {
  res.json({ enabled: buzzerEnabled });
};

const setBuzzerState = async (req, res) => {
  try {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Formato inválido. Esperado { enabled: boolean }' });
    }

    buzzerEnabled = enabled;
    console.log(`🔔 Buzzer agora está ${enabled ? 'ATIVO' : 'SILENCIADO'}`);

    const ESP_IP = process.env.ESP_IP || 'http://172.24.178.47:4000';
    const silent = !enabled;
    const url = `${ESP_IP}/api/sensor/silent`;

    console.log(`➡️ Enviando comando para ESP32: ${url} (silent=${silent})`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `silent=${silent}`
    });

    const text = await response.text();
    console.log('📡 Resposta do ESP32:', text);

    if (!response.ok) throw new Error(`ESP32 respondeu com status ${response.status}`);

    return res.json({ message: 'Estado do buzzer atualizado', enabled });
  } catch (error) {
    console.error('❌ Erro ao atualizar buzzer:', error.message);
    return res.status(500).json({ error: 'Falha ao comunicar com ESP32', detail: error.message });
  }
};

module.exports = { getBuzzerState, setBuzzerState };
