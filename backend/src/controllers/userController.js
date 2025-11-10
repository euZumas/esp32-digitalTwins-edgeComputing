// Importação de pacotes
require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const {v4: uuidv4} = require('uuid')

// Importação de Models
const User = require('../models/User')
const UserVerification = require('../models/UserVerification')
const PasswordReset = require('../models/PasswordReset')


// Rota privada
const perfil = async (req, res) => {
    try {
        // Verifica se o usuário existe
        const user = await User.findById(req.userId, '-password')

        if(!user) 
            return res.status(404).json({msg: "Usuário não encontrado!"})
        
        res.status(200).json(user)
    } catch(error) {
        console.log(error)
        res.status(500).json({msg: "Erro interno ao buscar usuário!"})
    }
    
} 

// Register endpoint
const userRegister = async (req, res) => {
    console.log(req.body)

    const { name, email, password, confirmPassword } = req.body

    // Validações
    if (!name) 
        return res.status(422).json({msg: "Campo nome obrigatório!"})
    if (!email) 
        return res.status(422).json({msg: "Campo email obrigatório!"})
    if (!password) 
        return res.status(422).json({msg: "Campo senha obrigatório!"})
    if(password !== confirmPassword)
        return res.status(422).json({msg: "As senhas não conferem!"})

    try {
        // Verifica se o usuário já existe
        const userExists = await User.findOne({ email: email })
        if (userExists) {
            return res.status(422).json({msg: "Usuário já cadastrado!"})
        }

        // Criação de senha
        const salt = await bcrypt.genSalt(10) // <- nível de criptografia
        const hashPassword = await bcrypt.hash(password, salt) // <- cria hash de senha

        // Criação de usuário
        const user = new User({
            name,
            email,
            password: hashPassword,
        })

        await user.save()
        return res.status(201).json({msg: "Usuário criado com sucesso"})
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Erro no servidor, tente novamente mais tarde!" })
    }

}

const sendVerificationEmail = async (req,res) => {
    const { email } = req.body

    try {
        const user = await User.findOne( {email} )

        // Verifica se o usuário existe
        if(!user)
            return res.status(404).json({msg: "Usuário não encontrado"})

        // Verifica se o usuário já verificou o email
        if (user.isVerified)
            return res.status(400).json({msg: "Usuário já verificado!"})

        // Apaga verificações pendentes (antigas)
        await UserVerification.deleteMany({userId: user._id})

        // Envia novo email
        await sendEmail(user)

        return res.status(200).json({msg: "Email de verificação enviado com sucesso!"})
    } catch(error) {
        return res.status(500).json({msg: "Erro ao enviar email!"})
    }
}


// Login endpoint
const userLogin = async (req, res) => {
    const { email, password } = req.body

    // Validações
    if (!email) 
        return res.status(422).json({msg: "Campo email obrigatório!"})
    if (!password) 
        return res.status(422).json({msg: "Campo senha obrigatório!"})

    try {
        // Busca o usuário pelo email
        const user = await User.findOne({ email: email })

        // Verifica se o usuário existe
        if (!user) {
            return res.status(404).json({msg: "Usuário não encontrado!"})
        }
        
        // Verifica se o usuário já confirmou o email
        if (!user.isVerified) {
        return res.status(403).json({ msg: "Email não verificado. Por favor, verifique seu email antes de logar." });
        }

        // Verifica se senha do usuário está correta
        const checkPassword = await bcrypt.compare(password, user.password) // <- Compara a senha enviada com a senha do usuário no banco
        if(!checkPassword) 
            return res.status(422).json({msg: "Senha inválida!"})
    
        // Gera o token JWT
        const secret = process.env.SECRET
        const token = jwt.sign({
            id: user._id,
        }, secret, {expiresIn: "1d"})

       // remove o campo senha do retorno
        const { password: _, ...userData } = user._doc;

        return res.status(200).json({
            msg: "Autenticação realizada com sucesso!",
            token,
            user: userData,
        });
    } catch(error) {
        console.log(error)
        return res.status(500).json({msg: "Erro no servidor, tente novamente mais tarde"})
    }
}



// Define responsável por transportar o email
let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})

transporter.verify((error, success) => {
    if(error) {
        console.log(error)
    } else {
        console.log("Pronto para iniciar")
        console.log(success)
    }
})

// Envia email de verificação
const sendEmail = async ({_id, name, email}, res) => {
    const url = `http://localhost:${process.env.PORT}`
    const uniqueString = uuidv4() + _id

    // Configurações de email
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verifique seu email",
        html: `<p>Olá <b>${name}</b>,</p>
               <p>Obrigado por se cadastrar! Para ativar sua conta, confirme seu email clicando no botão abaixo:</p>
      
               <a href="${url}/auth/verify/${_id}/${uniqueString}"
                style="display:inline-block; margin: 16px 0; padding: 10px 20px; background-color:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
                Verificar meu email
               </a>

               <p><b>Este link expira em 15 minutos.</b></p>
               <p>Se você não fez este cadastro, basta ignorar este email — nenhuma ação será tomada.</p>

               <br>
               <p>Atenciosamente,</p>
               <p> <b>Equipe ESP32</b> </p>`,
    }

    try {
        // Apaga tokens antigos antes de criar um novo
        await UserVerification.deleteMany( {userId: _id} )

        // Criptografa o link de confirmação
         const hashUniqueString = await bcrypt.hash(uniqueString, 10)

        // Cria novo registro de verificação
        const newVerification = new UserVerification({
            userId: _id,
            uniqueString: hashUniqueString,
            expiresAt: Date.now() + 900000
        })

        await newVerification.save()

        // Envia email
        await transporter.sendMail(mailOptions)
    } catch(error) {
        console.log(error)

        if (error.message.includes("hash")) {
            return res.status(500).json({msg: "Ocorreu um erro ao encriptografar o link de confirmação!"})
        }
        if (error.message.includes("save")) {
            return res.status(500).json({msg: "Falha ao salvar dados de confirmação de email!"})
        }
        if (error.message.includes("sendMail")) {
            return res.status(500).json({msg: "Falha ao enviar email!"})
        }

        return res.status(500).json({msg: "Erro interno ao processar verificação de email!"})
    }
}

const userVerify = async (req, res) => {
    const { id, uniqueString } = req.params

    try {
        const result = await UserVerification
        .find({ userId: id })
        .sort({createdAt: -1}) // <- Solicitação mais recente primeiro
        .limit(1)

        if (result.length === 0) {
            return res.status(404).json({ msg: "Link inválido ou usuário já verificado." })
        }

        const { _id: verificationId, expiresAt, uniqueString: hashedUniqueString } = result[0]

        //  Verifica se expirou
        if (expiresAt < Date.now()) {
            await UserVerification.deleteOne({ _id: verificationId })
            return res.status(410).json({ msg: "O link expirou. Faça o cadastro novamente." })
        }

        // Compara string do link com hash salvo
        const isMatch = await bcrypt.compare(uniqueString, hashedUniqueString)
        if (!isMatch) {
            return res.status(400).json({ msg: "Link de verificação inválido." })
        }

        // Marca usuário como verificado
        await User.updateOne({ _id: id }, { isVerified: true })

        // Remove o registro de verificação
        await UserVerification.deleteOne({ _id: verificationId })

       
        return res.redirect('http://localhost:5173/auth/login?verified=true')

    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Erro interno ao verificar o email." })
    }
}


// Forgot Password endpoint
const forgotPasswordLink = async (req, res) => {
    const { email, redirectUrl } = req.body

    try {
        const user = await User.findOne({email})
        
        //Verifica campo email
        if (!email) {
            return res.status(404).json({ msg: "Não há usuário registrado com esse email!" })
        }

        // Verifica se o usuário está verificado
        if(!user.isVerified) {
            return res.status(403).json({msg: "Email não verificado!"})     
        }
        
        // Apaga requisições de troca de senha anteriores
        await PasswordReset.deleteMany( {userId: user._id} )

        // Envia email para reset de senha
        await sendPasswordChangeEmail(user, redirectUrl, res)

    } catch(error) {
        console.log(error)
        return res.status(500).json({msg: "Falha ao verificar usuário existente!"})
    }
}

const sendPasswordChangeEmail = async ({_id, name, email}, redirectUrl, res) => {
    const url = redirectUrl
    const resetString = uuidv4() + _id

    try {
        // Limpa todas as solicitações de redefinição de senhas do usuário
        await PasswordReset.deleteMany({ userId: _id })

        // Configura email
        const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Redefinição de senha",
        html: `<p>Olá <b>${name}</b>,</p>
               <p>Recebemos uma solicitação para redefinir sua senha. Se foi você, clique no link abaixo para criar uma nova senha:</p>

               <a href="${url}/${_id}/${resetString}"
                    style="display:inline-block;margin:16px 0;padding:10px 20px;background-color:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">
                    Redefinir minha senha
               </a>

               <p> <b>Este link expira em 15 minutos.</b> </p>
               <p>Se você não solicitou essa redefinição, ignore este email.</p>

               <br> <p>Atenciosamente,</p> 
               <p> <b>Equipe ESP32</b> </p>`, 
        }

        // Criptografa reset string
        const hashResetString = await bcrypt.hash(resetString, 10)

        // Cria registro de redefinição
        const newPassWordReset = new PasswordReset({
                userId: _id,
                resetString: hashResetString,
                expiresAt: Date.now() + 900000
            })
        
        await newPassWordReset.save()

        // Enviar email
        await transporter.sendMail(mailOptions)

        return res.status(202).json({situacao: "Pendente", msg: "Email de redefinição enviado!"})

    } catch(error) {
        console.log(error)

        if (error.message.includes("limpar registros")) {
            return res.status(500).json({ msg: "Falha ao limpar registros de redefinição de senha!" })
        } else if (error.message.includes("criptografar")) {
            return res.status(500).json({ msg: "Falha ao criptografar registro de redefinição de senha!" })
        } else if (error.message.includes("salvar")) {
            return res.status(500).json({ msg: "Não foi possível salvar registro de redefinição de senha!" })
        } else if (error.message.includes("redefinir")) {
            return res.status(500).json({ msg: "Falha ao redefinir nova senha!" })
        } else {
            return res.status(500).json({ msg: "Ocorreu um erro inesperado!" })
        }
    }
}

// PasswordChange
const PasswordChange = async (req, res) => {
    const { userId, resetString } = req.params
    const { newPassword, confirmNewPassword } = req.body

     // Validação de senha
    if (!newPassword || !confirmNewPassword) {
        return res.status(422).json({ msg: "Preencha os campos de senha!" })
    }
    if (newPassword !== confirmNewPassword) {
        return res.status(422).json({ msg: "As senhas não conferem!" })
    }
    
    try {
         // 2. Buscar registro de reset mais recente
        const result = await PasswordReset.find({ userId })
            .sort({ createdAt: -1 })
            .limit(1)

        if (result.length === 0) {
            return res.status(404).json({ msg: "Registro existente de redefinição de senha não encontrado!" })
        }

        const { _id: passwordResetId, expiresAt, resetString: hashedResetString } = result[0]

        // 3. Verifica se o token expirou
        if (expiresAt < Date.now()) {
            await PasswordReset.deleteOne({ _id: passwordResetId })
            return res.status(410).json({ msg: "Registro de redefinição de senha expirou!" })
        }

        // 4. Invalida todas as solicitações anteriores
        await PasswordReset.deleteMany({ 
            userId, 
            _id: { $ne: passwordResetId } 
        })

        // 5. Compara o resetString da URL com o hash salvo
        const isMatch = await bcrypt.compare(resetString, hashedResetString)
        if (!isMatch) {
            await PasswordReset.deleteMany({ userId })
            return res.status(400).json({ msg: "Detalhes de reset password string inválidos!" })
        }

        // 6. Criptografa a nova senha
        const hashNewPassword = await bcrypt.hash(newPassword, 10)

        // 7. Atualiza senha do usuário
        await User.updateOne({ _id: userId }, { password: hashNewPassword })

        // 8. Remove registro de redefinição usado
        await PasswordReset.deleteOne({ _id: passwordResetId })

        return res.status(200).json({ msg: "Senha alterada com sucesso!" })

    } catch(error) {
        console.log(error)
        res.status(500).json({ msg: "Falha ao verificar registro existente de redefinição de senha!" })
    }
}

// Exportar perfil se necessário
module.exports = { userRegister, userLogin, userVerify, sendVerificationEmail, forgotPasswordLink, PasswordChange, perfil }