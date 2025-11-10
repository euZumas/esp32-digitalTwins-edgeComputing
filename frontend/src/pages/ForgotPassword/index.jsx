import { useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify'
import { BsArrowLeft } from "react-icons/bs";
import Logo from "../../components/Logo/Logo";
import api from "../../services/api"
import apiError from '../../services/apiError'
import CooldownButton from "../../components/CooldownButton";


import "../../styles/Auth.css";
import "../../styles/common.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
        
    async function sendEmail() {
        try {
            await api.post('/auth/password/request', {
                email,
                redirectUrl: "http://localhost:5173/auth/password/reset"
            })
            toast.success("Email de redefinição enviado com sucesso!")
        }
        catch(error) {            
            apiError(error)
        }
    }

    return (
        <main className="flex-c main">
            <ToastContainer />

            <form className="container flex-c">
                <div className="back-wrapper">
                    <Link to="/auth/login" className="back-button flex">
                    <BsArrowLeft /> Voltar
                    </Link>
                </div>

                <Logo />
                
                <h1> Informe seu email </h1>

                <p className="txt"> 
                    Digite seu e-mail e vamos enviar um link para você criar uma nova senha.
                </p>
                
                <div className="input-field flex-c">
                    <label> Email </label>
                    <input type="email" placeholder="Digite o seu email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}/>
                </div>                              
                
                <CooldownButton onClick={sendEmail} cooldownTime={15} />
            </form>
        </main> 
    );
}

export default ForgotPassword;