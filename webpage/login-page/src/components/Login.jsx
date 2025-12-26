import React, { useState } from "react";
import { useForm } from "react-hook-form";
import "../assets/style.css";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

const [submitted, setSubmitted] = useState(false);

const onSubmit = data => {
  const userData = JSON.parse(localStorage.getItem(data.email));
  if (userData) {
    setSubmitted(true);
  } else {
    console.log("User does not exist");
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
