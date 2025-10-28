// Área de Importações
require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes') 

const app = express()
app.use(express.json()) // Configura app para receber JSON

// Conexão com o DB Atlas
connectDB()

// Rotas
app.use('/', userRoutes)

const port = process.env.PORT
app.listen(port, () => { console.log( `Servidor no ar! Porta: ${port}`) })