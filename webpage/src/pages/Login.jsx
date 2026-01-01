import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../assets/style.css";
import { auth } from "../firebase";
import { sendSignInLinkToEmail } from "firebase/auth";


function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

const [submitted, setSubmitted] = useState(false);

const onSubmit = async (data) => {
  try {
    const actionCodeSettings = {
      url: "http://localhost:5173/dashboard",
      handleCodeInApp: true
    };

    await sendSignInLinkToEmail(auth, data.email, actionCodeSettings);
    window.localStorage.setItem("emailForSignIn", data.email);
    setSubmitted(true);

  } catch (error) {
    console.log(error);
    alert("Error sending sign in link");
  }
};



  

return (
  <div className="login-container">
    <div className="login-card">

      {submitted ? (
        <div className="login-header">
          <h2>Check your inbox</h2>
          <p>You will get a verification email</p>
        </div>
      ) : (
        <>
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Enter your email</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder=" "
                  {...register("email", { required: true })}
                />
                <label>Email</label>
              </div>
              {errors.email && (
                <span className="error-message">Email required</span>
              )}
            </div>

            <button type="submit" className="login-btn">
              <span className="btn-text">Sign In</span>
              <span className="btn-loader"></span>
            </button>
          </form>
        </>
      )}
    </div>
  </div>
);

}

export default Login;
