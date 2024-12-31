import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import { useLanguage } from "../contexts/LanguageContext";

function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
        let response = await api.post(route, {
            username,
            password,
        });

        if (method === "register" && response.data.success) {
            response = await api.post("api/token/pair", {
                username,
                password,
            });
        }
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        navigate("/");
    } catch (error) {
        if (method === "register" && error.response?.data?.message) {
            setError(t("username_exists"));
        } else if (method === "login" && error.response?.data?.detail) {
            setError(t("invalid_credentials"));
        } else {
            setError(t("server_error"));
        }
    } finally {
        setTimeout(() => {
            setLoading(false);
        }, 400);
    }
};

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>{t(method)}</h1>

      {error && <div className="form-error">{error}</div>}

      <input
        className="form-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t("username")}
        disabled={loading}
        required
        onInvalid={e => e.target.setCustomValidity(t("field_required"))}
        onInput={e => e.target.setCustomValidity("")}

      />
      <input
        className="form-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("password")}
        disabled={loading}
        required
        onInvalid={e => e.target.setCustomValidity(t("field_required"))}
        onInput={e => e.target.setCustomValidity("")}
      />
      <button className="form-button" type="submit" disabled={loading}>
        {loading ? t("loading") : t(method)}
      </button>

      {method === "login" && (
        <div className="form-footer">
          <p>
            {t("no_account")}{" "}
            <Link to="/register" className="form-link">
              {t("register")}
            </Link>
          </p>
        </div>
      )}
    </form>
  );
}

export default Form;