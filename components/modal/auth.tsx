import React, { useState } from "react";
import supabase from "@/lib/supabaseClient";
import Cookies from "js-cookie";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  setIsLoggedIn,
  setUserId,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleClose = () => {
    setIsSignUp(false);
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user?.email_confirmed_at === null) {
        setError("Please confirm your email before signing in.");
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUserId(data.user.id);
      Cookies.set("access_token", data.session?.access_token || "", {
        expires: 7,
        secure: true,
        sameSite: "Strict",
      });

      setSuccessMessage("Signed in successfully!");
      setEmail("");
      setPassword("");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setIsLoggedIn(true);
      setUserId(data.user?.id || null);
      setSuccessMessage("Account created successfully!");
      setEmail("");
      setPassword("");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity opacity-100">
      <div className="bg-white rounded-lg w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isSignUp ? "Sign Up" : "Sign In"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-600 text-lg font-semibold"
          >
            ×
          </button>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
          {successMessage && (
            <p className="text-green-500 mb-2 text-sm">{successMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            className="text-blue-600 hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
