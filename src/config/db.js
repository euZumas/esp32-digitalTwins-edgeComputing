const mongoose = require('mongoose')

// Credenciais
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS
 
const connectDB = async () => {
    try {
        mongoose
        .connect(`mongodb+srv://${dbUser}:${dbPassword}@esp32-api.5vmkgtc.mongodb.net/?appName=esp32-api`)
        .then(() => {
        console.log("Conectado ao DB Atlas!") })
    } catch(err) {
        console.log("Erro ao conectar com DB Atlas", err.message)
    }
}
    
module.exports = connectDB