-- ==========================================
-- KODAVA BARBER SOLUTIONS - MODELAGEM DE BANCO
-- ==========================================

-- Habilitar a extensão pgcrypto se necessário para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PLANOS
CREATE TABLE planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL UNIQUE, -- 'Gratuito', 'Pro', 'Elite'
    limite_barbeiros INTEGER NOT NULL,
    limite_filiais INTEGER NOT NULL,
    limite_agendamentos_mes INTEGER NOT NULL,
    suporta_whatsapp BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Popular Planos Iniciais
INSERT INTO planos (nome, limite_barbeiros, limite_filiais, limite_agendamentos_mes, suporta_whatsapp)
VALUES 
('Gratuito', 1, 1, 50, FALSE),
('Pro', 5, 3, 500, TRUE),
('Elite', 9999, 9999, 999999, TRUE)
ON CONFLICT (nome) DO NOTHING;

-- 2. TABELA DE BARBEARIAS (TENANT)
CREATE TABLE barbearias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    subdominio VARCHAR(50) NOT NULL UNIQUE,
    dono_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plano_id UUID REFERENCES planos(id) ON DELETE SET NULL,
    google_review_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indice para buscas rapidas por subdominio
CREATE INDEX idx_barbearias_subdominio ON barbearias(subdominio);

-- 3. TABELA DE LOCAIS / FILIAIS
CREATE TABLE locais_filiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    endereco TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_locais_barbearia ON locais_filiais(barbearia_id);

-- 4. TABELA DE BARBEIROS
CREATE TABLE barbeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_barbeiros_barbearia ON barbeiros(barbearia_id);

-- 5. TABELA DE SERVIÇOS / PROCEDIMENTOS
CREATE TABLE servicos_procedimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barbearia_id UUID REFERENCES barbearias(id) ON DELETE CASCADE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos > 0),
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_servicos_barbearia ON servicos_procedimentos(barbearia_id);

-- 6. TABELA DE AGENDAMENTOS
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
);

CREATE INDEX idx_agendamentos_barbearia ON agendamentos(barbearia_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_hora);

-- Trigger para impedir mais de 1 agendamento por CPF no mesmo dia na mesma barbearia
CREATE OR REPLACE FUNCTION check_unique_cpf_booking_per_day()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM agendamentos 
        WHERE cliente_cpf = NEW.cliente_cpf 
          AND barbearia_id = NEW.barbearia_id
          AND DATE(data_hora AT TIME ZONE 'UTC') = DATE(NEW.data_hora AT TIME ZONE 'UTC')
          AND status != 'cancelado'
          AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Erro: Este CPF já possui um agendamento ativo para este dia nesta barbearia.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_unique_cpf_booking_per_day
BEFORE INSERT OR UPDATE ON agendamentos
FOR EACH ROW
EXECUTE FUNCTION check_unique_cpf_booking_per_day();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbearias ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais_filiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- POLÍTICAS: PLANOS
-- ------------------------------------------
CREATE POLICY "Qualquer usuario pode ver planos" ON planos
    FOR SELECT TO public USING (TRUE);

-- ------------------------------------------
-- POLÍTICAS: BARBEARIAS (TENANT)
-- ------------------------------------------
CREATE POLICY "Qualquer usuario pode visualizar barbearias públicas" ON barbearias
    FOR SELECT TO public USING (TRUE);

CREATE POLICY "Dono pode cadastrar sua barbearia" ON barbearias
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Dono pode gerenciar sua própria barbearia" ON barbearias
    FOR ALL TO authenticated 
    USING (auth.uid() = dono_id)
    WITH CHECK (auth.uid() = dono_id);

-- ------------------------------------------
-- POLÍTICAS: LOCAIS_FILIAIS
-- ------------------------------------------
CREATE POLICY "Qualquer usuario pode ver filiais" ON locais_filiais
    FOR SELECT TO public USING (TRUE);

CREATE POLICY "Dono gerencia locais da sua barbearia" ON locais_filiais
    FOR ALL TO authenticated
    USING (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    )
    WITH CHECK (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    );

-- ------------------------------------------
-- POLÍTICAS: BARBEIROS
-- ------------------------------------------
CREATE POLICY "Qualquer usuario pode ver barbeiros" ON barbeiros
    FOR SELECT TO public USING (TRUE);

CREATE POLICY "Dono gerencia barbeiros da sua barbearia" ON barbeiros
    FOR ALL TO authenticated
    USING (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    )
    WITH CHECK (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    );

-- ------------------------------------------
-- POLÍTICAS: SERVICOS_PROCEDIMENTOS
-- ------------------------------------------
CREATE POLICY "Qualquer usuario pode ver servicos" ON servicos_procedimentos
    FOR SELECT TO public USING (TRUE);

CREATE POLICY "Dono gerencia servicos da sua barbearia" ON servicos_procedimentos
    FOR ALL TO authenticated
    USING (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    )
    WITH CHECK (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    );

-- ------------------------------------------
-- POLÍTICAS: AGENDAMENTOS
-- ------------------------------------------
-- 1. Qualquer cliente pode inserir um agendamento
CREATE POLICY "Clientes podem criar agendamentos" ON agendamentos
    FOR INSERT TO public WITH CHECK (TRUE);

-- 2. Clientes podem ver seus próprios agendamentos pesquisando por telefone
CREATE POLICY "Clientes podem ver seus agendamentos por telefone" ON agendamentos
    FOR SELECT TO public USING (TRUE); -- Permite leitura pública filtrada no frontend pelo telefone

-- 3. O dono da barbearia possui controle total sobre os agendamentos da sua barbearia
CREATE POLICY "Dono gerencia agendamentos da sua barbearia" ON agendamentos
    FOR ALL TO authenticated
    USING (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    )
    WITH CHECK (
        barbearia_id IN (SELECT id FROM barbearias WHERE dono_id = auth.uid())
    );
