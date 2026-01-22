"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useAuth } from "~/contexts/auth-context";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "./loading";

export function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const { mutate: loginMutation, isPending: isLoggingIn } =
    api.auth.login.useMutation({
      onSuccess: (data) => {
        login(data.token, data.user);
        toast.success("Login successful!");
        setEmail("");
        setPassword("");
      },
      onError: (error) => {
        toast.error(error.message || "Login failed. Please try again.");
      },
    });

  const { mutate: registerMutation, isPending: isRegistering } =
    api.auth.register.useMutation({
      onSuccess: (data) => {
        login(data.token, data.user);
        toast.success("Registration successful!");
        setEmail("");
        setUsername("");
        setPassword("");
      },
      onError: (error) => {
        toast.error(error.message || "Registration failed. Please try again.");
      },
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation({ email, password });
    } else {
      registerMutation({ email, username, password });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl pointer-events-none" />
        
        <div className="relative">
          {/* Tab switcher */}
          <div className="flex gap-2 mb-8 bg-slate-800/30 p-1.5 rounded-xl border border-slate-700/30">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isLogin
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                !isLogin
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/40 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800/60 transition-all duration-200 border border-slate-700/40 hover:border-slate-600/60 placeholder:text-slate-500"
                required
                disabled={isLoggingIn || isRegistering}
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800/40 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800/60 transition-all duration-200 border border-slate-700/40 hover:border-slate-600/60 placeholder:text-slate-500"
                  required
                  disabled={isLoggingIn || isRegistering}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-800/40 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800/60 transition-all duration-200 border border-slate-700/40 hover:border-slate-600/60 placeholder:text-slate-500"
                required
                disabled={isLoggingIn || isRegistering}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoggingIn || isRegistering}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {(isLoggingIn || isRegistering) && <LoadingSpinner size={20} />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
