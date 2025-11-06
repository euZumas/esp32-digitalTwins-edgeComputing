require('dotenv').config();
const jwt = require('jsonwebtoken');

function checkToken(req, res, next) {
    const authHeader = req.headers.authorization

    if(!authHeader)
        return res.status(401).json({msg: "Token não fornecido!"})

    // Verifica se o header foi enviado e extrai o token
    const [, token] = authHeader.split(' ')

    try {
        const secret = process.env.SECRET

        // Verifica token e decodifica payload
        const decoded = jwt.verify(token, secret)

        // Salva os dados do token no request para uso posterior
        req.userId = decoded.id

        next()
    } catch(err) {
        res.status(401).json({msg: "Token inválido!"})
    }
}

module.exports = checkToken