// Área de Importações
require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes') 
const sensorRoutes = require('./routes/sensorRoutes') 
const cors = require('cors')

const app = express()

// Habilita o CORS
app.use(cors())

app.use(express.json()) // Configura app para receber JSON

// Conexão com o DB Atlas
connectDB()

// Rotas
app.use('/', userRoutes)
app.use('/', sensorRoutes)
app.use('/', buzzerRoutes


const port = process.env.PORT
app.listen(port, () => { console.log( `Servidor no ar! Porta: ${port}`) })