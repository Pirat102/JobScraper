import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import "../styles/NotFound.css";

function NotFound() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="not-found-container">
      <h1>404</h1>
      <p>{t("page_not_found")}</p>
      <button 
        className="return-home-button" 
        onClick={() => navigate("/")}
      >
        {t("return_home")}
      </button>
    </div>
  );
}

export default NotFound;