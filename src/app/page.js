'use client';

import React, { useState } from 'react';
import { 
  Database, ShieldCheck, Cpu, Smartphone, Calendar, 
  Check, AlertTriangle, Plus, Trash2, ExternalLink, 
  Copy, Download, Star, Sparkles, LogIn, Lock
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'schema' | 'rls' | 'client' | 'simulator'
  
  // Simulator States
  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [googleReviewLink, setGoogleReviewLink] = useState('https://g.page/r/your-barbershop-review');
  const [message, setMessage] = useState(null);
  
  const [bookings, setBookings] = useState([
    { id: 1, name: 'Thiago Mota', phone: '(11) 98888-7777', cpf: '123.456.789-00', date: new Date().toISOString().split('T')[0], time: '10:00' }
  ]);

  const handleBooking = (e) => {
    e.preventDefault();
    
    // Clean CPF for verification
    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      setMessage({ type: 'error', text: 'Por favor, digite um CPF válido.' });
      return;
    }

    // Verify if there is already an active booking for this CPF on the same day (Simulating database trigger)
    const hasBookingToday = bookings.some(
      b => b.cpf.replace(/\D/g, '') === cleanCpf && b.date === date
    );

    if (hasBookingToday) {
      setMessage({
        type: 'error',
        text: 'Erro de Banco de Dados: Este CPF já possui um agendamento ativo para este dia nesta barbearia. (Bloqueado pela TRIGGER/Constraint no Supabase!)'
      });
      return;
    }

    // Success booking
    const newBooking = {
      id: Date.now(),
      name,
      phone,
      cpf,
      date,
      time
    };

    setBookings([newBooking, ...bookings]);
    setMessage({
      type: 'success',
      text: 'Agendamento cadastrado com sucesso no Supabase!',
      booking: newBooking
    });

    // Reset fields except date
    setName('');
    setPhone('');
    setCpf('');
  };

  // Google Calendar Integration Link Generator
  const getGoogleCalendarLink = (b) => {
    const startDateTime = new Date(`${b.date}T${b.time}:00`).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDateTime = new Date(`${b.date}T${b.time}:00`);
    endDateTime.setMinutes(endDateTime.getMinutes() + 45); // 45 min duration
    const endFormatted = endDateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const title = encodeURIComponent(`Corte de Cabelo - Kodava Barber`);
    const details = encodeURIComponent(`Olá ${b.name}, seu corte está agendado na Kodava Barber.\nTelefone: ${b.phone}`);
    const location = encodeURIComponent(`Unidade Shopping Central`);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endFormatted}&details=${details}&location=${location}`;
  };

  // Mobile Calendar .ics File Generator
  const downloadIcsFile = (b) => {
    const startDate = `${b.date.replace(/-/g, '')}T${b.time.replace(/:/g, '')}00Z`;
    const endDate = `${b.date.replace(/-/g, '')}T${parseInt(b.time.split(':')[0]) + 1}${b.time.split(':')[1]}00Z`;
    
    const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kodava Solutions//Barber App//PT
BEGIN:VEVENT
UID:uid_${b.id}@kodavabarber.com
DTSTAMP:${startDate}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Corte de Cabelo - Kodava Barber
DESCRIPTION:Agendamento de ${b.name} (${b.phone})
LOCATION:Unidade Shopping Central
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agendamento_${b.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-12">
      {/* HEADER NAVBAR */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              K
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                KODAVA BARBER SOLUTIONS
              </span>
              <span className="text-[10px] block text-blue-500 font-bold tracking-widest uppercase -mt-1">
                Next.js & Supabase SaaS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700 hidden sm:inline-block">
              🛠️ Arquitetura Multi-Tenant Ativa
            </span>
            <Link 
              href="/login" 
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/15"
            >
              <LogIn size={14} /> Entrar / Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center md:text-left md:flex md:items-center md:justify-between gap-12 border-b border-zinc-900">
        <div className="max-w-xl">
          <span className="text-xs font-bold tracking-widest text-blue-500 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Nova Stack Homologada
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-4 mb-6 text-white">
            Backend Robusto e Escalável para Múltiplas Barbearias
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Integração nativa com o Supabase utilizando regras rígidas de segurança (RLS), restrição de CPF diário no banco de dados e integração de agendas de calendários.
          </p>
        </div>
        <div className="hidden md:block bg-zinc-900/40 border border-zinc-800 p-8 rounded-2xl max-w-sm w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-semibold text-sm">Políticas RLS Aplicadas</h3>
          </div>
          <p className="text-xs text-zinc-400 leading-normal">
            Dono da Barbearia A jamais acessa os dados da Barbearia B. O isolamento de tenants ocorre em tempo de execução direto no PostgreSQL.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto gap-2">
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'simulator' 
                ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone size={16} /> Simulador Interativo (CPF + Agenda)
          </button>
          
          <button 
            onClick={() => setActiveTab('schema')}
            className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'schema' 
                ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database size={16} /> Script de Banco (Supabase SQL)
          </button>

          <button 
            onClick={() => setActiveTab('rls')}
            className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'rls' 
                ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck size={16} /> Segurança RLS
          </button>

          <button 
            onClick={() => setActiveTab('client')}
            className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'client' 
                ? 'border-blue-500 text-blue-400 bg-blue-950/20' 
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cpu size={16} /> Setup do Cliente Next.js
          </button>
        </div>

        {/* TAB CONTENT: SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Form & Configs */}
            <div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-yellow-500" size={18} fill="currentColor" />
                  <h3 className="font-semibold text-lg">Configurar Barbearia (Tenant)</h3>
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Link de Avaliação do Google (Google Review Link)
                  </label>
                  <input 
                    type="url" 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    value={googleReviewLink}
                    onChange={(e) => setGoogleReviewLink(e.target.value)}
                    placeholder="https://g.page/r/your-shop/review"
                  />
                </div>
              </div>

              {/* Booking form */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" /> Simular Agendamento de Cliente
                </h3>

                {message && (
                  <div className={`p-4 rounded-xl border text-sm mb-6 flex gap-3 ${
                    message.type === 'error' 
                      ? 'bg-red-950/30 border-red-900/50 text-red-400' 
                      : 'bg-green-950/30 border-green-900/50 text-green-400'
                  }`}>
                    {message.type === 'error' ? <AlertTriangle className="shrink-0" size={18} /> : <Check className="shrink-0" size={18} />}
                    <div>{message.text}</div>
                  </div>
                )}

                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 font-medium mb-1.5">Nome do Cliente</label>
                      <input 
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Silva"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 font-medium mb-1.5">Telefone</label>
                      <input 
                        type="text" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: (11) 99999-8888"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 font-medium mb-1.5">
                      CPF (Limite de 1 agendamento por CPF/Dia)
                    </label>
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="Ex: 123.456.789-00"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-zinc-400 font-medium mb-1.5">Data</label>
                      <input 
                        type="date" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 font-medium mb-1.5">Horário</label>
                      <input 
                        type="time" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors mt-2"
                  >
                    Agendar Corte
                  </button>
                </form>
              </div>
            </div>

            {/* Bookings & Integrations Display */}
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-6 flex justify-between items-center">
                  <span>Agendamentos do Dia (Simulador)</span>
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded">
                    Total: {bookings.length}
                  </span>
                </h3>

                <div className="space-y-4 max-h-[350px] overflow-y-auto">
                  {bookings.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-8">Nenhum agendamento ativo.</p>
                  ) : (
                    bookings.map(b => (
                      <div key={b.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white text-sm">{b.name}</h4>
                            <p className="text-xs text-zinc-400 mt-1">CPF: {b.cpf}</p>
                            <p className="text-xs text-zinc-400">Tel: {b.phone}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-blue-400 font-semibold block">{b.date}</span>
                            <span className="text-sm text-white font-bold">às {b.time}</span>
                          </div>
                        </div>

                        {/* Integration buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-zinc-900">
                          <a 
                            href={getGoogleCalendarLink(b)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <Calendar size={12} /> Google Calendar
                          </a>
                          <button 
                            onClick={() => downloadIcsFile(b)}
                            className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <Download size={12} /> Agenda Celular (.ics)
                          </button>
                          <a 
                            href={googleReviewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ml-auto"
                          >
                            <Star size={12} fill="currentColor" /> Avaliar no Google
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-6 text-sm">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-400">
                  💡 Como funciona esta proteção de CPF no banco de dados?
                </h4>
                <p className="text-zinc-400 leading-relaxed mb-3">
                  Ao tentar agendar, o Supabase executa um gatilho automático (<strong>BEFORE INSERT TRIGGER</strong>) para validar o CPF informado. Se encontrar algum outro agendamento pendente/confirmado para o mesmo CPF na mesma data, a operação é rejeitada e gera uma exceção no Postgres.
                </p>
                <p className="text-zinc-400 leading-relaxed">
                  Isso evita sobreposições e fraudes de clientes agendando múltiplos horários concorrentes no mesmo dia.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT: SCHEMA */}
        {activeTab === 'schema' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-bold text-lg">supabase/schema.sql</h3>
                <p className="text-xs text-zinc-400">Estrutura de tabelas e integridade relacional com suporte a multi-tenant</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`-- Script de schema do Supabase`);
                  alert('Copiado!');
                }}
                className="btn btn-secondary btn-sm gap-1.5"
              >
                <Copy size={14} /> Copiar SQL
              </button>
            </div>
            
            <pre className="text-xs text-zinc-300 font-mono bg-zinc-950 p-6 rounded-xl overflow-x-auto max-h-[500px]">
{`CREATE TABLE planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL UNIQUE,
    limite_barbeiros INTEGER NOT NULL,
    limite_filiais INTEGER NOT NULL,
    limite_agendamentos_mes INTEGER NOT NULL,
    suporta_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE barbearias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    subdominio VARCHAR(50) NOT NULL UNIQUE,
    dono_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plano_id UUID REFERENCES planos(id) ON DELETE SET NULL,
    google_review_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE locais_filiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE barbeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE servicos_procedimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    duracao_minutos INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    local_id UUID REFERENCES locais_filiais(id) ON DELETE CASCADE NOT NULL,
    barbeiro_id UUID REFERENCES barbeiros(id) ON DELETE CASCADE NOT NULL,
    cliente_nome VARCHAR(100) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_cpf VARCHAR(14) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);`}
            </pre>
          </div>
        )}

        {/* TAB CONTENT: RLS SECURITY */}
        {activeTab === 'rls' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-2">Segurança de Acesso (RLS)</h3>
            <p className="text-sm text-zinc-400 mb-6">Políticas no Postgres do Supabase para garantir isolamento absoluto de lojistas (Tenants).</p>
            
            <div className="space-y-6">
              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-blue-400 font-semibold text-sm mb-3">1. Proteção da Barbearia (Tenant)</h4>
                <p className="text-xs text-zinc-400 mb-4">Apenas o proprietário associado ao dono_id do Supabase Auth pode modificar as configurações de sua barbearia.</p>
                <pre className="text-xs text-zinc-300 font-mono bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`CREATE POLICY "Dono pode gerenciar sua própria barbearia" ON barbearias
    FOR ALL TO authenticated 
    USING (auth.uid() = dono_id)
    WITH CHECK (auth.uid() = dono_id);`}
                </pre>
              </div>

              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-blue-400 font-semibold text-sm mb-3">2. Proteção de Dados Secundários (Barbeiros, Filiais, Serviços)</h4>
                <p className="text-xs text-zinc-400 mb-4">Validamos se o `barbearia_id` pertence a uma barbearia cujo `dono_id` é o ID autenticado no Supabase.</p>
                <pre className="text-xs text-zinc-300 font-mono bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`CREATE POLICY "Dono gerencia profissionais da sua barbearia" ON barbeiros
    FOR ALL TO authenticated
    USING (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    )
    WITH CHECK (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    );`}
                </pre>
              </div>

              <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                <h4 className="text-blue-400 font-semibold text-sm mb-3">3. Proteção contra Injeção de Agendamentos Rejeitados</h4>
                <p className="text-xs text-zinc-400 mb-4">Garante que apenas o dono da barbearia possa visualizar e modificar os agendamentos da própria barbearia.</p>
                <pre className="text-xs text-zinc-300 font-mono bg-zinc-900 p-4 rounded-lg overflow-x-auto">
{`CREATE POLICY "Dono gerencia agendamentos da sua barbearia" ON agendamentos
    FOR ALL TO authenticated
    USING (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    )
    WITH CHECK (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    );`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CLIENT SETUP */}
        {activeTab === 'client' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-2">Instalação do Supabase no Next.js (App Router)</h3>
            <p className="text-sm text-zinc-400 mb-6">Estrutura de inicialização recomendada para Next.js 15 utilizando a biblioteca oficial de cookies `@supabase/ssr`.</p>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-zinc-300 text-sm mb-2">src/utils/supabase/client.js (Client Component client)</h4>
                <pre className="text-xs text-zinc-300 font-mono bg-zinc-950 p-4 rounded-lg overflow-x-auto">
{`import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-300 text-sm mb-2">src/utils/supabase/server.js (Server Component client)</h4>
                <pre className="text-xs text-zinc-300 font-mono bg-zinc-950 p-4 rounded-lg overflow-x-auto">
{`import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // O setAll foi chamado de um Server Component.
            // Pode ser ignorado se você tiver o middleware atualizando a sessão.
          }
        },
      },
    }
  );
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
