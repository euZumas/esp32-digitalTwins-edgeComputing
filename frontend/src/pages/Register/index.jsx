import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'
import api from '../../services/api'
import apiError from '../../services/apiError'

import Logo from "../../components/Logo/Logo";
import "../../styles/Auth.css";
import "../../styles/Register.css"
import "../../styles/common.css";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate()

    async function createUser(event) {
        event.preventDefault();

        try {
            await api.post('/auth/register', {
                name: name,
                email: email,
                password: password,
                confirmPassword: confirmPassword
            })

            toast.success('Você será redirecionado para verificar seu email!')

            setTimeout(() => {
                navigate('/auth/verify/sendEmail', {state: {email}})
            }, 1500)   
        }
        catch(error) {            
            apiError(error)
        }
    }

    return (
        <main className="flex-c">
            <ToastContainer />
            <form className="container flex-c" onSubmit={createUser}>
                <Logo />
                
                <h1> Crie sua conta </h1>

                <div className="input-field flex-c">
                    <label> Usuário </label>
                    <input type="text" placeholder="Digite o seu nome de usuário" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}/>
                </div>
                
                <div className="input-field flex-c">
                    <label> Email </label>
                    <input type="email" placeholder="Digite o seu email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
                </div>
                
                <div className="input-field flex-c">
                    <label> Senha </label>
                    <input type="password" placeholder="Digite a sua senha" 
                    minLength="4"
                    maxLength="12"
                    size="12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
                </div>

                <div className="input-field flex-c">
                    <label> Confirmar senha </label>
                    <input type="password" placeholder="Confirme a sua senha" 
                    minLength="4"
                    maxLength="12"
                    size="12"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}/>
                </div>
                                
                
                <button type='submit' className="flex"> 
                    <span> Cadastre-se </span> 
                </button>

                <div className="links-session flex-c">
                    <p className="register-login"> 
                        Já tem conta? |
                        <Link to="/auth/login"> Entre aqui </Link>
                    </p>
                </div>
            </form>
        </main> 
    );
}

export default Register