import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://burgertic-jacofsky-czerwiak.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Agregar prefijo /api a todas las rutas
app.use('/api/platos', platoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/auth', authRoutes); // Si existe ruta de auth