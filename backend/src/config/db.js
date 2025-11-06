const mongoose = require('mongoose')

// Credenciais
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@esp32-api.5vmkgtc.mongodb.net/?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: true, // força uso de TLS
      }
    )

    console.log(`Conectado ao MongoDB Atlas: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ Erro ao conectar com o MongoDB Atlas:')
    console.error('Mensagem:', err.message)
    console.error('Código:', err.code || '(sem código)')
  }
}

module.exports = connectDB