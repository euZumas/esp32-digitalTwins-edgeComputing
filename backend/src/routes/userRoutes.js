const express = require('express')
const router = express.Router()
const { 
    userRegister, 
    userLogin, 
    userVerify, 
    sendVerificationEmail, 
    forgotPasswordLink, 
    PasswordChange,
    perfil 
} = require('../controllers/userController')

const checkToken = require('../middlewares/authMiddleware')

// Registro e login
router.post('/auth/register', userRegister)
router.post('/auth/login', userLogin)

// Verificação de email
router.post('/auth/verify/sendEmail', sendVerificationEmail)
router.get('/auth/verify/:id/:uniqueString', userVerify)

// Reset de senha
router.post('/auth/password/request', forgotPasswordLink)
router.post('/auth/password/reset/:userId/:resetString', PasswordChange)

// Rotas privadas
router.get('/user/profile', checkToken, perfil)

// Bloqueia rota raiz (home) para não logados
router.get('/', checkToken, (req, res) => {
    res.status(200).json({ msg: "Bem-vindo à página inicial protegida!" })
})

module.exports = router