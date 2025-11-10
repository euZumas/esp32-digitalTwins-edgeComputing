import { MdLock } from "react-icons/md";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../../components/Logo/Logo";
import api from "../../services/api";
import apiError from "../../services/apiError";

import "../../styles/Auth.css";
import "../../styles/Login.css";
import "../../styles/common.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  async function loginUser(event) {
    event.preventDefault();

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      // 🔒 Armazena token e informações do usuário
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Usuário logado!");

      setTimeout(() => {
        navigate("/", { state: { email } });
      }, 1500);
    } catch (error) {
      apiError(error);
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    if (query.get("verified") === "true") {
      toast.success("Email verificado com sucesso! Faça login para continuar.");
    }
  }, [location]);

  return (
    <main className="flex-c main">
      <ToastContainer />
      <form onSubmit={loginUser} className="container flex-c">
        <Logo />

        <h1>Login</h1>

        <div className="input-field flex-c">
          <label>Email</label>
          <input
            type="email"
            placeholder="Digite o seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-field flex-c">
          <label>Senha</label>
          <input
            type="password"
            placeholder="Digite a sua senha"
            maxLength="12"
            size="12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="flex">
          <MdLock className="icon" />
          <span>Entrar</span>
        </button>

        <div className="links-session flex-c">
          <Link to="/auth/password/request" className="forgot">
            esqueceu sua senha?
          </Link>
          <p className="register-login">
            Não tem conta? | <Link to="/auth/register">Cadastre-se</Link>
          </p>
        </div>
      </form>
    </main>
  );
};

export default Login;