import { useLocation }  from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import api from '../../services/api'
import Logo from "../../components/Logo/Logo"
import CooldownButton from '../../components/CooldownButton'
import apiError from '../../services/apiError'

import "../../styles/Auth.css"
import "../../styles/common.css"
import "../../styles/VerifyEmail.css"

const ForgotPassword = () => {
    const { state } = useLocation()
    const email = state?.email
    
    async function sendEmail() {
        try {
            await api.post('/auth/verify/sendEmail', {email})
            toast.success("Email de verificação enviado!")
        }
        catch(error) {
            apiError(error)
        }
    }

    return (
        <main className="flex-c">
            <ToastContainer />

            <form className="container flex-c">
                <Logo />
                
                <h1> Verifique seu email </h1>

                <p> Você informou <span id="emailAddress"> {email} </span> como o endereço de e-mail da sua conta. </p>               
                <p> Por favor, confirme este e-mail clicando no botão abaixo. </p>
                                
                <CooldownButton onClick={sendEmail} cooldownTime={15} />
            </form>
        </main> 
    );
}

export default ForgotPassword;