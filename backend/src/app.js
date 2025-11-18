import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://burgertic-jacofsky-czerwiak.vercel.app'
  ],
  credentials: true
};

app.use(cors(corsOptions));