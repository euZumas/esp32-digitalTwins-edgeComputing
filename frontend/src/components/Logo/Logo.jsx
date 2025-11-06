import LogoImg from "../../assets/coelho-icon.png"
import "../../styles/Logo.css"
import "../../styles/common.css"

const Logo = () => {
    return(
        <div className="logo flex">
            <img src={LogoImg} />
        </div>
    );
}

export default Logo;