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
    toastError(`${isSignup?'Sign Up':'Login'} Failed`);
  };

  return (
    <div className="flex flex-col space-y-5 h-screen items-center bg-gray-100">
      <div className="flex flex-col items-center justify-center py-14 h-20">
        <h1 className="text-4xl font-bold text-gray-800">Auction Area</h1>
        <p className="text-lg text-gray-600">Your trusted online auction platform</p>
      </div>

      <div className="flex items-center justify-center w-1/2">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
          <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            {isSignup ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-center mb-6 text-gray-600">
            {isSignup
              ? "Please create an account using your Google account."
              : "Sign in with your Google account to continue."}
          </p>

          <div>
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={isSignup?handleGoogleSignUpSuccess:handleLoginSuccess}
                  onError={handleLoginFailure}
                  text={isSignup ? "signup_with" : "signin_with"}
                  theme="outline"
                />
              </div>
              <p className="flex justify-center text-center text-gray-600 space-x-1">
                <span>{isSignup?"Already have an account?":"Don't have an account?"}</span>
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-indigo-600 hover:text-indigo-500 transition-all"
                >
                  {isSignup?"Login":"Sign Up"}
                </button>
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
