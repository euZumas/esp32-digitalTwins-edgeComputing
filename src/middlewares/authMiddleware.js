require('dotenv').config();
const jwt = require('jsonwebtoken');

function checkToken(req, res, next) {
    const authHeader = req.headers['authorization']

    // Verifica se o header foi enviado e extrai o token
    const token = authHeader && authHeader.split(" ")[1] // Bearer <token>

    if(!token) {
        return res.status(401).json({msg: "Acesso negado!"})
    }

    try {
        const secret = process.env.SECRET

        // Verifica token e decodifica payload
        const decoded = jwt.verify(token, secret)

        // Salva os dados do token no request para uso posterior
        req.user = decoded

        next()
    } catch(err) {
        res.status(400).json({msg: "Token inválido!"})
    }
}

module.exports = checkToken