import express from "express";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { paymentRepo, projectRepo } from "./src/system/database";

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
  
  // Global Stats
  app.get("/api/stats", (req, res) => {
    const projects = projectRepo.getAll();
    const dynamicImpact = projects.reduce((acc, p) => acc + p.raised, 0);
    const dynamicCauses = projects.filter(p => p.raised > 0).length;
    
    res.json({
      totalImpact: 125400 + dynamicImpact,
      supportedCauses: 42 + dynamicCauses,
      communityMembers: 856 + Math.floor(dynamicImpact / 1000)
    });
  });

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
    const projects = projectRepo.getAll();
    console.log(`[API] GET /api/projects - Returning ${projects.length} projects`);
    res.json(projects);
  });

  // User Profile Mock
  app.get("/api/user/profile/:address", (req, res) => {
    res.json({
      address: req.params.address,
      balance: 5500,
      impactPoints: 120,
      history: [
        { id: "h1", type: "vote", project: "Un Lugar — General Cabrera", date: "2024-02-20" },
        { id: "h2", type: "donation", amount: 500, date: "2024-02-15" },
      ]
    });
  });

  // --- Payments Mock API ---
  // Hardcoded initial projects
  const INITIAL_PROJECTS = [
    {
      id: "1",
      title: "Un Lugar — General Cabrera",
      description: "Espacio comunitario que brinda desayuno, almuerzo y merienda a niños y niñas de 2 a 16 años. Ofrece contención, juego y aprendizaje a los más vulnerables de nuestra comunidad.",
      status: "active",
      raised: 87500,
      goal: 150000,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop",
      category: "Infancia y Alimentación",
      walletAddress: "0x742d35Cc6634C0532925a3b8D4C9b4444"
    },
    {
      id: "2",
      title: "Asociación Civil Comedor Comunitario Tía Kusi",
      description: "Comedor comunitario en Córdoba Capital que asiste a familias en situación de vulnerabilidad con alimentación y apoyo escolar.",
      status: "active",
      raised: 45000,
      goal: 100000,
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop",
      category: "Alimentación",
      walletAddress: "0x821d35Cc6634C0532925a3b8D4C9b4444"
    },
    {
      id: "3",
      title: "Comedor Pancitas Felices",
      description: "Brindamos raciones diarias y talleres para niños en Córdoba Capital. Nuestro objetivo es erradicar la desnutrición infantil.",
      status: "active",
      raised: 32000,
      goal: 80000,
      image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000&auto=format&fit=crop",
      category: "Infancia",
      walletAddress: "0x932e35Cc6634C0532925a3b8D4C9b4444"
    },
    {
      id: "4",
      title: "Remar Córdoba",
      description: "Centro comunitario de ayuda social, merenderos y rehabilitación de adicciones. Trabajamos en la reinserción social y apoyo integral.",
      status: "active",
      raised: 120000,
      goal: 250000,
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1000&auto=format&fit=crop",
      category: "Social y Salud",
      walletAddress: "0xa43f35Cc6634C0532925a3b8D4C9b4444"
    }
  ];

  // Hardcoded initial payments for persistence and specific history
  const INITIAL_PAYMENTS = [
    // Un Lugar — General Cabrera
    {
      id: "PAY-Cabrera-1",
      merchantId: "1",
      merchantName: "Un Lugar — General Cabrera",
      fiatAmount: 2500, // 2500 ARS
      tokenAmount: 25,   // 25 GSO
      status: "completed",
      description: "Donación anónima",
      createdAt: 1744011408000, 
      expiresAt: 1744011408000 + 1800000,
      walletAddress: "0x742d35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x7b2f8a9c4d5e6f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a"
    },
    {
      id: "PAY-Cabrera-2",
      merchantId: "1",
      merchantName: "Un Lugar — General Cabrera",
      fiatAmount: 10000,
      tokenAmount: 100,
      status: "completed",
      description: "Donación Empresa Local Cabrera",
      createdAt: 1743752208000,
      expiresAt: 1743752208000 + 1800000,
      walletAddress: "0x742d35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"
    },
    {
      id: "PAY-Cabrera-3",
      merchantId: "1",
      merchantName: "Un Lugar — General Cabrera",
      fiatAmount: 1000,
      tokenAmount: 10,
      status: "completed",
      description: "Donante anónimo",
      createdAt: 1743493008000,
      expiresAt: 1743493008000 + 1800000,
      walletAddress: "0x742d35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e"
    },
    {
      id: "PAY-Cabrera-4",
      merchantId: "1",
      merchantName: "Un Lugar — General Cabrera",
      fiatAmount: 25000,
      tokenAmount: 250,
      status: "completed",
      description: "Donación Municipalidad Gral. Cabrera",
      createdAt: 1742888208000,
      expiresAt: 1742888208000 + 1800000,
      walletAddress: "0x742d35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c"
    },
    // Tía Kusi
    {
      id: "PAY-Kusi-1",
      merchantId: "2",
      merchantName: "Asociación Civil Comedor Comunitario Tía Kusi",
      fiatAmount: 5000,
      tokenAmount: 50,
      status: "completed",
      description: "Apoyo mensual",
      createdAt: 1743925008000,
      expiresAt: 1743925008000 + 1800000,
      walletAddress: "0x821d35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f"
    },
    // Pancitas Felices
    {
      id: "PAY-Pancitas-1",
      merchantId: "3",
      merchantName: "Comedor Pancitas Felices",
      fiatAmount: 3000,
      tokenAmount: 30,
      status: "completed",
      description: "Donación para insumos",
      createdAt: 1743838608000,
      expiresAt: 1743838608000 + 1800000,
      walletAddress: "0x932e35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b"
    },
    // Remar Córdoba
    {
      id: "PAY-Remar-1",
      merchantId: "4",
      merchantName: "Remar Córdoba",
      fiatAmount: 15000,
      tokenAmount: 150,
      status: "completed",
      description: "Contribución rehabilitación",
      createdAt: 1743665808000,
      expiresAt: 1743665808000 + 1800000,
      walletAddress: "0xa43f35cc6634c0532925a3b8d4c9b4444",
      txHash: "0x6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d"
    }
  ];

  // Seed database with hardcoded payments if they don't exist
  try {
    console.log("[Seed] Checking for initial projects...");
    INITIAL_PROJECTS.forEach(p => {
      const existing = projectRepo.getById(p.id);
      if (!existing) {
        console.log(`[Seed] Adding missing project: ${p.id}`);
        projectRepo.create(p as any);
      }
    });

    console.log("[Seed] Checking for initial payments...");
    INITIAL_PAYMENTS.forEach(p => {
      const existing = paymentRepo.getById(p.id);
      if (!existing) {
        console.log(`[Seed] Adding missing payment: ${p.id}`);
        paymentRepo.create(p as any);
      }
    });
  } catch (err) {
    console.error("[Seed] Error seeding database:", err);
  }

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
      
      if (!data.merchantName || !data.fiatAmount) {
        console.warn("[API] Missing required fields in payment creation");
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }

      const id = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes
      const newPayment = { 
        merchantId: data.merchantId || null,
        merchantName: data.merchantName,
        description: data.description || 'Sin descripción',
        walletAddress: data.walletAddress || '',
        id, 
        status: 'awaiting_payment', 
        tokenAmount: Number(data.tokenAmount) || 0,
        fiatAmount: Number(data.fiatAmount) || 0,
        createdAt: Date.now(),
        expiresAt
      };
      
      console.log(`[API] Attempting to save payment to DB:`, id);
      paymentRepo.create(newPayment as any);
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
    
    const oldStatus = payment.status;
    const newStatus = req.body.status;
    
    const updated = paymentRepo.update(id, req.body);
    
    // If payment just completed, increment project raised amount
    if (oldStatus !== 'completed' && newStatus === 'completed' && payment.merchantId) {
      const amountToIncrement = Number(payment.tokenAmount);
      console.log(`[API] Payment ${id} completed. Incrementing raised amount for project ${payment.merchantId} by ${amountToIncrement}`);
      projectRepo.incrementRaised(payment.merchantId, amountToIncrement);
      
      // Verify update
      const updatedProject = projectRepo.getById(payment.merchantId);
      console.log(`[API] Project ${payment.merchantId} new raised amount: ${updatedProject?.raised}`);
    }
    
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
