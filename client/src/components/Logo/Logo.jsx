import React from "react";
import styles from "./Logo.module.css";
import LogoSS from "../../assets/logo.png";

const Logo = () => {
  return (
    <div className={styles.logo} onClick={() => navigate("/")}>
      <img src={LogoSS} alt="logo-image" />
      <h2>Chat</h2>
    </div>
  );
};

export default Logo;
