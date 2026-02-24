import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

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
        image: "https://picsum.photos/seed/comedor/800/600",
        category: "Alimentación",
      },
      {
        id: "2",
        title: "Becas Escolares GSO",
        description: "Financiamiento de materiales para niños en zonas rurales.",
        status: "completed",
        raised: 50000,
        goal: 50000,
        image: "https://picsum.photos/seed/becas/800/600",
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
