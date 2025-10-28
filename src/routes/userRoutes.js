const express = require('express')
const router = express.Router()
const { userRegister, userLogin, userVerify, resendVerificationEmail, resetPassword, PasswordChange, perfil } = require('../controllers/userController')
const checkToken = require('../middlewares/authMiddleware')

// Registro e login
router.post('/auth/register', userRegister)
router.post('/auth/login', userLogin)

// Verificação de email
router.get('/auth/verify/:id/:uniqueString', userVerify)
router.post('/auth/verify/resend', resendVerificationEmail)

// Reset de senha
router.post('/auth/password/request', resetPassword)
router.post('/auth/password/reset', PasswordChange)

// Rotas privadas
router.get('/user/:id', checkToken, perfil)

module.exports = router