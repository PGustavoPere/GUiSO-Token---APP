import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
// In-memory storage for payments
const payments: Record<string, any> = {};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Mock API Routes ---

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
    res.json(Object.values(payments));
  });

  app.post("/api/payments", (req, res) => {
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

  app.put("/api/payments/:id", (req, res) => {
    const id = req.params.id;
    if (!payments[id]) {
      return res.status(404).json({ error: "Payment not found" });
    }
    payments[id] = { ...payments[id], ...req.body };
    res.json(payments[id]);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GUISO Server running on http://localhost:${PORT}`);
  });
}

startServer();
