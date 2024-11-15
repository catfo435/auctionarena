import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toastError, toastSuccess, toastWarn } from "../toasts";
import { useState } from "react";

const LoginPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignUpSuccess = async (credentials: CredentialResponse) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then(async (res) => {
        if (res.status === 201) {
          toastSuccess("Signup successful, please login");
          setIsSignup(false);
        } else {
          toastError(await res.text());
        }
      })
      .catch((e) => {
        toastError("Something went wrong during signup.");
        console.log(e);
      });
  };

  const handleLoginSuccess = async (credentials: CredentialResponse) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then(async (res) => {
        if (res.status === 401) {
          toastWarn(await res.text());
        } else if (res.status === 200) {
          navigate("/");
        } else if (res.status === 404) {
          toastError("User not found");
        } else {
          toastError("Something went wrong");
        }
      })
      .catch((e) => {
        toastError("Something went wrong");
        console.log(e);
      });
  };

  const handleLoginFailure = () => {
    toastError("Login Failed");
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">
          {isSignup ? "Sign Up" : "Welcome Back"}
        </h1>
        <p className="text-center mb-6 text-gray-600">
          {isSignup
            ? "Please create an account using your Google account."
            : "Please sign in with your Google account to continue."}
        </p>

        {isSignup ? (
          <div>
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSignUpSuccess}
                onError={handleLoginFailure}
                text={isSignup?"signup_with":"signin_with"}
              />
            </div>
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-indigo-600"
              >
                Login
              </button>
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginFailure}
              />
            </div>
            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-indigo-600"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
