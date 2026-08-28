import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from 'react-router-dom';
import "../assets/style.css";
import { useAuth } from '../auth-context';


function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

const [submitted, setSubmitted] = useState(false);
const [requestError, setRequestError] = useState('');
const { completeEmailLink, pendingEmailLink, sendEmailLink, user } = useAuth();

const onSubmit = async (data) => {
  setRequestError('');
  try {
    if (pendingEmailLink) {
      await completeEmailLink(data.email);
    } else {
      await sendEmailLink(data.email);
      setSubmitted(true);
    }
  } catch (error) {
    console.error(error);
    setRequestError(pendingEmailLink ? 'We could not confirm that email address. Request a new sign-in link and try again.' : 'We could not send a sign-in link. Please try again.');
  }
};

if (user) return <Navigate to="/dashboard" replace />;


  

return (
  <main className="login-page">
    <div className="login-container">
      <div className="login-card">

      {submitted ? (
        <div className="login-header">
          <h2>Check your inbox</h2>
          <p>Open the sign-in link we sent to continue to SylCal.</p>
        </div>
      ) : (
        <>
          <div className="login-header">
            <h2>{pendingEmailLink ? 'Confirm your email' : 'Sign in'}</h2>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>{pendingEmailLink ? 'Enter the email address that received this link.' : 'We’ll send a sign-in link to your inbox.'}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder=" "
                  autoComplete="email"
                  {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                />
                <label htmlFor="email">Email</label>
              </div>
              {errors.email && (
                <span className="error-message">Enter a valid email address</span>
              )}
            </div>

            <button type="submit" className="login-btn" disabled={isSubmitting} aria-busy={isSubmitting}>
              <span className="btn-text">{isSubmitting ? 'Sending sign-in link…' : pendingEmailLink ? 'Confirm sign in' : 'Send sign-in link'}</span>
            </button>
            {requestError && <p className="error-message" role="alert">{requestError}</p>}
          </form>
        </>
      )}
      </div>
    </div>
  </main>
);

}

export default Login;
