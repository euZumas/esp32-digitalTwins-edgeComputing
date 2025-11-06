import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../../components/Logo/Logo";
import api from "../../services/api"
import apiError from '../../services/apiError'

import "../../styles/Auth.css";
import "../../styles/Register.css"
import "../../styles/common.css";

const ResetPassword = () => {
    const { userId, resetString } = useParams()
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const navigate = useNavigate()

    async function changePassword (event) {
        event.preventDefault();

        try {
            const response =    await api.post(`/auth/password/reset/${userId}/${resetString}`, {
                newPassword: newPassword,
                confirmNewPassword: confirmNewPassword
            })
            
            toast.success(response.data.msg)
            setTimeout(() => navigate("/auth/login"), 2000);
        } catch(error) {
            apiError(error)
        }
    }

    return (
        <main onSubmit={changePassword} className="flex-c">
            <ToastContainer />
            <form className="container flex-c">
                <Logo />
                
                <h1> Redefina sua senha </h1>

                <div className="input-field flex-c">
                    <label> Senha </label>
                    <input type="password" placeholder="Digite a sua senha"
                    minLength="4"
                    maxLength="12"
                    size="12"
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}/>
                </div>

                <div className="input-field flex-c">
                    <label> Confirmar senha </label>
                    <input type="password" placeholder="Confirme a sua senha"
                    minLength="4"
                    maxLength="12"
                    size="12"
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)}/>
                </div>
                                
                
                <button className="flex"> 
                    <span> Definir Senha </span> 
                </button>
                
            </form>
        </main> 
    );
}

export default ResetPassword;