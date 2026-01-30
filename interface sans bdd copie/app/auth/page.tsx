"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Cpu } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      router.push("/chat");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      <Link href="/" className="absolute top-8 left-8">
        <Button
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Link>

      <Card className="w-full max-w-md glass border-white/5 animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center neon-glow">
            <img src="/logo2.png" alt="AI Logo" className="h-10 w-flex"/>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              {isLogin ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-white/40">
              {isLogin
                ? "Enter your credentials to access AI"
                : "Join the next generation of AI productivity"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/70">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="bg-white/5 border-white/10 text-white focus:border-primary/50"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold transition-all active:scale-95"
              disabled={isLoading}
            >
              {isLoading
                ? "Synchronizing..."
                : isLogin
                ? "Launch AI"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/40 hover:text-primary transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
