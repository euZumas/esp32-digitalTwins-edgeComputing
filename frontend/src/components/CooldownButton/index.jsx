import { useState } from "react"

import "../../styles/Auth.css"
import "../../styles/VerifyEmail.css"
import "../../styles/common.css"

const CooldownButton = ({ onClick, cooldownTime = 15 }) => {
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const handleClick = async () => {
    // Verifica se o botão de enviar está em cooldown
    if (isSending || cooldown > 0) return

    try {
        setIsSending(true)

        // Executa a função passada como prop
        await onClick() 

        // Inicia o cooldown de 30 segundos
        setCooldown(cooldownTime)
        const interval = setInterval(() => {
            setCooldown(prev => {
            if (prev <= 1) {
                clearInterval(interval)
                return 0
            }
            return prev - 1
            })
        }, 1000)

        } catch (error) {
            console.error(error)
        } finally {
            setIsSending(false)
        }
    }

  return (
    <button type="button" onClick={handleClick} className={`flex ${isSending || cooldown > 0 ? "disabled-button" : ""}`}> 
        {isSending
            ? <span id="spinner" />
            : (cooldown > 0)
                ? <span id='cooldown'> Espere {cooldown} </span>
                : <span> Enviar Email </span>
        }
    </button>
  )
}

export default CooldownButton   