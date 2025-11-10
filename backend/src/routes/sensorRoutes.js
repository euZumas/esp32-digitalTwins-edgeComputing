const express = require('express')
const router = express.Router()
const { 
    RegisterSensorData, 
    getSensorData,
    getActiveSensorData,
} = require('../controllers/SensorController')

const { 
    setRoom, 
    getRoom, 
    getCurrentRoomValue
} = require('../controllers/roomController')

// Receber dados do ESP32
router.post('/api/sensor', RegisterSensorData)

// Obter dados
router.get('/api/sensor', getSensorData)

// Obter dados
router.get('/api/sensor/active', getActiveSensorData)

// Definir ambiente
router.post('/api/sensor/room', setRoom)

// Obter ambiente
router.get('/api/sensor/room', getRoom)

module.exports = router     