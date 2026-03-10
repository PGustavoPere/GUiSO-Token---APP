import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

console.log("Starting GUISO Server initialization...");
const payments: Record<string, any> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for express-rate-limit and other proxy-aware middlewares
  app.set('trust proxy', 1);

  // Manual CORS implementation for maximum compatibility
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Helper for SSE Errors
  const sseError = (res: express.Response, message: string) => {
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  };

  // Request Logger - Move to the very top
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      console.log(`[API Request] ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    }
    next();
  });

  app.use(express.json({ limit: '10mb' })); // Limit body size

  // --- Mock API Routes ---
  // Define these BEFORE static files to ensure they take precedence
  
  // Token Stats
  app.get("/api/token/stats", (req, res) => {
    res.json({
      price: 0.042,
      priceChange24h: 5.4,
      circulatingSupply: 65000000,
      totalSupply: 100000000,
      holders: 1240,
      marketCap: 2730000,
    });
  });

  // Social Projects
  app.get("/api/projects", (req, res) => {
    res.json([
      {
        id: "1",
        title: "Comedor Comunitario 'El Sol'",
        description: "Apoyo mensual con raciones de comida para 200 personas.",
        status: "active",
        raised: 150000,
        goal: 200000,
        image: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=1000&auto=format&fit=crop",
        category: "Alimentación",
        walletAddress: "0xd823...a1a6"
      },
      {
        id: "2",
        title: "Becas Escolares GSO",
        description: "Financiamiento de materiales para niños en zonas rurales.",
        status: "completed",
        raised: 50000,
        goal: 50000,
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop",
        category: "Educación",
        walletAddress: "0x742d...4444"
      }
    ]);
  });

  // User Profile Mock
  app.get("/api/user/profile/:address", (req, res) => {
    res.json({
      address: req.params.address,
      balance: 5500,
      impactPoints: 120,
      history: [
        { id: "h1", type: "vote", project: "Comedor El Sol", date: "2024-02-20" },
        { id: "h2", type: "donation", amount: 500, date: "2024-02-15" },
      ]
    });
  });

  // --- Payments Mock API ---
  app.get("/api/payments", (req, res) => {
    console.log("[API] Serving GET /api/payments");
    res.json(Object.values(payments));
  });

  app.post("/api/payments", express.json(), (req, res) => {
    const data = req.body;
    const id = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    payments[id] = { ...data, id, status: 'awaiting_payment', createdAt: Date.now() };
    res.json({ id });
  });

  app.get("/api/payments/:id", (req, res) => {
    const payment = payments[req.params.id];
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  });

  app.put("/api/payments/:id", express.json(), (req, res) => {
    const id = req.params.id;
    if (!payments[id]) {
      return res.status(404).json({ error: "Payment not found" });
    }
    payments[id] = { ...payments[id], ...req.body };
    
    // Notify SSE clients
    notifyPaymentUpdate(id);
    
    res.json(payments[id]);
  });

  // --- SSE for Real-time Payment Updates ---
  const sseClients = new Set<express.Response>();

  const notifyPaymentUpdate = (paymentId: string) => {
    const payment = payments[paymentId];
    if (!payment) return;
    
    const data = JSON.stringify(payment);
    sseClients.forEach(client => {
      client.write(`data: ${data}\n\n`);
    });
  };

    app.get("/api/payments/stream", (req, res) => {
      try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        sseClients.add(res);

        req.on('close', () => {
          sseClients.delete(res);
        });

        // Send initial heartbeat
        res.write(': heartbeat\n\n');
      } catch (err: any) {
        console.error("SSE Connection Error:", err);
        sseError(res, "Failed to establish SSE connection");
        res.end();
      }
    });

  // Catch-all for undefined API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Serve public directory
  app.use(express.static(path.join(process.cwd(), "public")));

  // --- Vite Middleware ---
  const isProduction = process.env.NODE_ENV === "production";
  const hasDist = fs.existsSync(path.join(process.cwd(), "dist"));

  if (!isProduction || !hasDist) {
    console.log("Using Vite middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist...");
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  // --- Error Handler ---
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Server Error:", err);
    if (req.url.startsWith("/api/")) {
      return res.status(err.status || 500).json({ 
        error: err.message || "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? err.stack : undefined
      });
    }
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GUISO Server successfully started and listening on http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
