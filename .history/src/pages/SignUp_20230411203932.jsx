import axios from "axios";
import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { signIn } from "../authSlice";
import { Header } from "../components/Header";
import { url } from "../const";
import "./signUp.scss";

export function SignUp() {
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessge] = useState();
  const [cookies, setCookie, removeCookie] = useCookies();
  const navigate = useNavigate();
  // フォームに記入した情報を状態として保存する。
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNameChange = (e) => setName(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const onSignUp = () => {
    // Email等を状態として保存する。
    const data = {
      email,
      name,
      password,
    };

    axios
      .post(`${url}/users`, data)
      .then((res) => {
        const { token } = res.data;
        // StateをSigninにするためにDiapatchでActionを送信する
        dispatch(signIn());
        // クッキーに帰ってきたtokenを"token"というタグで保存する。
        setCookie("token", token);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessge(`サインアップに失敗しました。 ${err}`);
      });
    // すでにサインしている場合は直接ホーム画面に移行する。
    if (auth) return <Navigate to="/" />;
  };
  return (
    <div>
      <Header />
      <main className="signup">
        <h2>新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form html className="signup-form">
          <label>メールアドレス
          
          <input
            type="email"
            onChange={handleEmailChange}
            className="email-input"
          />
          </label>
          <br />
          <label>ユーザ名</label>
          <br />
          <input
            type="text"
            onChange={handleNameChange}
            className="name-input"
          />
          <br />
          <label>パスワード</label>
          <br />
          <input
            type="password"
            onChange={handlePasswordChange}
            className="password-input"
          />
          <br />
          <button type="button" onClick={onSignUp} className="signup-button">
            作成
          </button>
        </form>
      </main>
    </div>
  );
}
