// backend/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carrega .env da pasta raiz
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 39400;

// Middleware para CORS
// Permite requisições do frontend
app.use(cors({
  origin: '*', // Permite requisições de qualquer origem
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Inicializa Supabase Client com a service_role key
// Esta chave permite ignorar RLS e ter acesso completo aos dados
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidas.');
  process.exit(1); // Sai da aplicação se as chaves não estiverem configuradas
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const TRACKING_ACTIVATION_TOKEN = process.env.TRACKING_ACTIVATION_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;

if (!TRACKING_ACTIVATION_TOKEN || !JWT_SECRET) {
  console.error('Erro: Variáveis de ambiente TRACKING_ACTIVATION_TOKEN ou JWT_SECRET não definidas.');
  process.exit(1);
}

// Rota para ativar o rastreamento e gerar um link com token
app.post('/activate-tracking', (req, res) => {
  const { userId, token } = req.body;

  // Valida o token de ativação (pre-compartilhado)
  if (token !== TRACKING_ACTIVATION_TOKEN) {
    return res.status(403).json({ message: 'Token de ativação inválido.' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
  }

  // Gera um JWT com validade de 2 horas (2 * 60 * 60 segundos)
  const expiryTimeInSeconds = 2 * 60 * 60;
  const jwtToken = jwt.sign({ userId, exp: Math.floor(Date.now() / 1000) + expiryTimeInSeconds }, JWT_SECRET);

  // Retorna o link que o frontend usará para acessar os dados
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const trackingLink = `${frontendUrl}/map?token=${jwtToken}`;

  res.status(200).json({ message: 'Link de rastreamento gerado com sucesso.', trackingLink });
});

// Rota para buscar dados de localização (protegida por JWT)
app.get('/map-data', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do cabeçalho "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  try {
    // Verifica e decodifica o JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // O token tem um 'exp' (expiration) claim, que é verificado automaticamente por jwt.verify
    // Se o token estiver expirado, jwt.verify lançará um erro

    // Pega a data de hoje no formato YYYYMMDD
    const today = new Date();
    const formattedDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    // Busca o histórico de localização do Supabase
    // Usamos a service_role_key, então não precisamos de RLS para esta operação no backend
    const { data, error } = await supabase
      .from('locations_users')
      .select('latitude, longitude, timestamp')
      .eq('user_id', userId)
      .eq('date', formattedDate) // Filtra pela data de hoje
      .order('timestamp', { ascending: true }); // Garante a ordem cronológica

    if (error) {
      console.error('Erro Supabase:', error);
      return res.status(500).json({ message: 'Erro ao buscar dados de localização.', details: error.message });
    }

    res.status(200).json(data);

  } catch (err) {
    console.error('Erro de autenticação ou token inválido:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Acesso expirado. Por favor, gere um novo link.' });
    }
    return res.status(403).json({ message: 'Token inválido ou acesso não autorizado.' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend rodando em http://0.0.0.0:${port} (acessível externamente se porta estiver exposta)`);
  console.log(`Frontend URL configurado: ${process.env.FRONTEND_URL}`);
});

