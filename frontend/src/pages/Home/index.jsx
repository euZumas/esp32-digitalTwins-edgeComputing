import {Link} from 'react-router-dom'
import '../../styles/common.css'

const Home = () => {
    return(
        <div className='flex-c'>
            <Link to='/auth/login'> Login </Link>
            <Link to='/auth/register'> Register </Link>
            <Link to='/auth/verify/resend'> Esqueceu a senha </Link>
            <Link to='/auth/password/reset'> Resetar senha </Link>
            <Link to='/auth/verify/sentEmail'> Verificar email </Link>
        </div>
    );
}

export default Home;