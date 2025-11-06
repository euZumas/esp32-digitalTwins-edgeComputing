import { toast } from 'react-toastify'

export default function apiError(error, customMessage = null) {
  const status = error.response?.status
  const msg = error.response?.data?.msg || customMessage || "Erro inesperado! Tente novamente mais tarde."

  switch (status) {
    case 400:
      toast.warn(msg || "Requisição inválida!")
      break

    case 401:
      toast.warn(msg || "Não autorizado! Faça login novamente.")
      break

    case 403:
      toast.warn(msg || "Acesso negado! Verifique suas permissões.")
      break

    case 404:
      toast.warn(msg || "Recurso não encontrado!")
      break

    case 410:
      toast.warn(msg || "Este link expirou! Tente novamente.")
      break

    case 422:
      toast.warn(msg || "Campos obrigatórios ausentes ou incorretos.")
      break

    case 429:
      toast.warn(msg || "Muitas tentativas. Aguarde alguns segundos.")
      break

    case 500:
      toast.error(msg || "Erro interno do servidor!")
      break

    case 503:
      toast.error(msg || "Servidor temporariamente indisponível.")
      break

    default:
      toast.error(msg || "Erro desconhecido. Verifique sua conexão.")
  }
}