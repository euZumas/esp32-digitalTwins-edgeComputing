const Sensor = require('../models/Sensor')

const RegisterSensorData = async (req, res) => {
  try {
    console.log("Payload recebido:", req.body) // <-- debug importante

    const { motion, timestamps, datetime, room } = req.body

    if (motion === undefined) {
      return res.status(400).json({ msg: "Campo 'motion' ausente" })
    }

    // prioriza o room enviado; se vazio usa fallback
    const activeRoom = room && room.trim() !== "" ? room : "Laboratório 1"

    // aceita timestamps ou datetime; se inválido, usa agora
    const tsCandidate = timestamps || datetime
    const ts = tsCandidate ? new Date(tsCandidate) : new Date()
    if (isNaN(ts.getTime())) {
      console.warn("Timestamp inválido no payload, usando Date.now()")
      ts = new Date()
    }

    if (motion === true) {
      // Início: salva um registro com duration null
      const newEntry = new Sensor({
        motion: true,
        timestamps: ts,
        room: activeRoom,
        duration: null
      })
      await newEntry.save()
      console.log("Novo início salvo:", newEntry._id)
      return res.status(201).json({ msg: "Início salvo", data: newEntry })
    } else {
      // Fim do evento: tenta achar último true (qualquer duration)
      // Preferência: último true com duration null, senão último true qualquer
      let lastTrue = await Sensor.findOne({ room: activeRoom, motion: true, duration: null }).sort({ createdAt: -1 })
      if (!lastTrue) {
        lastTrue = await Sensor.findOne({ room: activeRoom, motion: true }).sort({ createdAt: -1 })
      }

      if (!lastTrue) {
        // sem true anterior: salva false avulso
        const falseEntry = new Sensor({
          motion: false,
          timestamps: ts,
          room: activeRoom,
          duration: 0
        })
        await falseEntry.save()
        console.log("False salvo sem par:", falseEntry._id)
        return res.status(201).json({ msg: "Fim salvo (sem par)", data: falseEntry })
      }

      const start = lastTrue.timestamps || lastTrue.createdAt
      const diffSec = Math.max(0, Math.round((ts - start) / 1000))
      lastTrue.duration = diffSec
      await lastTrue.save()

      // opcional: salvar um registro false para histórico (mantém par)
      await new Sensor({
        motion: false,
        timestamps: ts,
        room: activeRoom,
        duration: diffSec
      }).save()

      console.log(`Evento finalizado (${activeRoom}): ${diffSec}s -- updated ${lastTrue._id}`)
      return res.status(200).json({ msg: "Duração calculada", data: { id: lastTrue._id, duration: diffSec }})
    }
  } catch (error) {
    console.log("Erro ao salvar dados:", error.message)
    return res.status(500).json({ msg: "Erro interno do servidor" })
  }
}

// Histórico completo
const getSensorData = async (req, res) => {
  try {
    const data = await Sensor.find().sort({ createdAt: -1 })
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ msg: "Erro ao buscar dados" })
  }
}

// Apenas ativos
const getActiveSensorData = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50
    const data = await Sensor.find({ motion: true }).sort({ createdAt: -1 }).limit(limit)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ msg: "Erro ao buscar dados ativos" })
  }
}

module.exports = { RegisterSensorData, getSensorData, getActiveSensorData }