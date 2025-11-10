const mongoose = require('mongoose')

const sensorSchema = new mongoose.Schema({
    motion: {
        type: Boolean,
        required: true
    },
    timestamps: {
        type: Date,
        default: Date.now
    },
    room: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,        
        default: null
    }
}, { timestamps: true })

module.exports = mongoose.model('Sensor', sensorSchema)