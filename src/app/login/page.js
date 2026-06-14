'use client';

import React, { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Lock, Mail, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redireciona o usuário para o callback de autenticação configurado
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || 'Erro ao conectar com a conta do Google.');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setSuccess(true);
      // Redireciona após o login
      window.location.href = '/dashboard';
    } catch (err) {
      setErrorMsg(err.message || 'Credenciais inválidas.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-8 relative shadow-2xl">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Voltar para o agendador
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            K
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Acesse o seu Painel</h2>
          <p className="text-zinc-400 text-xs mt-1.5">
            Gerencie múltiplos barbeiros, agendas e planos em um só lugar.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-start gap-3 text-xs text-red-400">
            <AlertCircle className="shrink-0" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="mb-6 p-4 bg-green-950/20 border border-green-900/50 rounded-xl flex items-start gap-3 text-xs text-green-400">
            <Sparkles className="shrink-0" size={16} />
            <span>Autenticação efetuada com sucesso! Redirecionando...</span>
          </div>
        )}

        {/* OAuth Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-3 transition-all cursor-pointer border border-zinc-200/80 shadow-md mb-6 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Entrar com o Google</span>
        </button>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
            ou usar e-mail
          </span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        {/* Form Email Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1.5">Endereço de E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
              <input 
                type="email" 
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none focus:bg-zinc-950 transition-all"
                required
                placeholder="seuemail@provedor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 font-medium mb-1.5">Sua Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-zinc-500" size={16} />
              <input 
                type="password" 
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none focus:bg-zinc-950 transition-all"
                required
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors mt-4 shadow-lg shadow-blue-600/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Acessando...' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Novo na Kodava Barber?{' '}
          <Link href="/" className="text-blue-500 font-semibold hover:underline">
            Crie sua conta
          </Link>
        </div>
      </div>
    </div>
  );
}
