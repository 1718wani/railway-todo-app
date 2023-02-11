import React from "react";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { useNavigate } from "react-router-dom";
import { signOut } from "../authSlice";
import classes from "./header.module.scss";

export function Header() {
  const auth = useSelector((state) => state.auth.isSignIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies();
  const handleSignOut = () => {
    dispatch(signOut());
    removeCookie("token");
    navigate("/signin");
  };

  return (
    <header className="classesheader">
      <h1>Todoアプリ</h1>
      {auth ? (
        <button onClick={handleSignOut} className={classes.sign-out-button}>
          サインアウト
        </button>
      ) : (
        <></>
      )}
    </header>
  );
}
