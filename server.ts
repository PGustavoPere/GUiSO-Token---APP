import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { paymentRepo } from "./src/system/database";

console.log("Starting GUISO Server initialization...");

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Standard middlewares
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));

  // Request Logger
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/')) {
      console.log(`[API Request] ${req.method} ${req.url}`);
    }
    next();
  });

  // --- Health Check ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now(), env: process.env.NODE_ENV });
  });

  // Helper for SSE Errors
  const sseError = (res: express.Response, message: string) => {
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
  };

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
    try {
      const allPayments = paymentRepo.getAll();
      console.log(`[API] Serving GET /api/payments - Found ${allPayments.length} payments`);
      res.setHeader('Content-Type', 'application/json');
      res.json(allPayments);
    } catch (err: any) {
      console.error("Error in GET /api/payments:", err);
      res.status(500).json({ error: "Internal Server Error", message: err.message });
    }
  });

  app.post("/api/payments", express.json(), (req, res) => {
    try {
      const data = req.body;
      console.log(`[API] Received POST /api/payments with data:`, JSON.stringify(data));
      const id = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes
      const newPayment = { 
        ...data, 
        id, 
        status: 'awaiting_payment', 
        createdAt: Date.now(),
        expiresAt
      };
      paymentRepo.create(newPayment);
      console.log(`[API] Created payment with ID: ${id}`);
      res.json({ id });
    } catch (err: any) {
      console.error("Error in POST /api/payments:", err);
      res.status(500).json({ error: "Error al crear el pago", message: err.message });
    }
  });

  app.get("/api/payments/:id", (req, res) => {
    const id = req.params.id;
    console.log(`[API] GET /api/payments/${id}`);
    const payment = paymentRepo.getById(id);
    if (!payment) {
      console.warn(`[API] Payment not found: ${id}`);
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    console.log(`[API] Returning payment: ${id} (Status: ${payment.status})`);
    res.json(payment);
  });

  app.put("/api/payments/:id", express.json(), (req, res) => {
    const id = req.params.id;
    const payment = paymentRepo.getById(id);
    if (!payment) {
      return res.status(404).json({ error: "Pago no encontrado" });
    }
    const updated = paymentRepo.update(id, req.body);
    
    // Notify SSE clients
    notifyPaymentUpdate(id);
    
    res.json(updated);
  });

  // --- SSE for Real-time Payment Updates ---
  const sseClients = new Set<express.Response>();

  const notifyPaymentUpdate = (paymentId: string) => {
    const payment = paymentRepo.getById(paymentId);
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
  app.all("/api/*all", (req, res) => {
    res.status(404).json({ error: `Ruta de API no encontrada: ${req.method} ${req.url}` });
  });

  // Serve public directory
  app.use(express.static(path.join(process.cwd(), "public")));

  // --- Vite Middleware ---
  const isProduction = process.env.NODE_ENV === "production";
  const hasDist = fs.existsSync(path.join(process.cwd(), "dist"));

  if (!isProduction || !hasDist) {
    console.log("Using Vite middleware for development...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true // Allow all hosts in Vite 6
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production build from dist...");
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*all", (req, res) => {
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
