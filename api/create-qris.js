// Stok Manual (Akan reset jika server Vercel restart/redeploy)
let internalStock = {
  "rbx-100": 50,
  "rbx-200": 25
};

export default async function handler(req, res) {
  // CORS agar bisa diakses dari index.html
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { amount, order_id, product_id } = req.body || {};

    // 1. Validasi Input
    if (!amount || !order_id || !product_id) {
      return res.status(400).json({ error: "Data tidak lengkap (amount, order_id, product_id)" });
    }

    // 2. Validasi Minimal Rp 1.000 (Syarat Pakasir)
    if (amount < 1000) {
      return res.status(400).json({ error: "Minimal transaksi adalah Rp 1.000" });
    }

    // 3. Cek Stok
    if (internalStock[product_id] === undefined || internalStock[product_id] <= 0) {
      return res.status(400).json({ error: "Maaf, stok produk habis!" });
    }
    
    const project = "fishit-market"; //
    const api_key = "BLTv3xG4QMEmgSO0teA5WCvEQZRA3Wx9"; //

    const pakasirRes = await fetch(
      "https://app.pakasir.com/api/transactioncreate/qris",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, api_key, order_id, amount })
      }
    );

    const result = await pakasirRes.json();
    
    if (pakasirRes.ok) {
        internalStock[product_id] -= 1; // Potong stok jika QRIS berhasil dibuat
        return res.status(200).json(result);
    } else {
        return res.status(400).json({ error: result.error || "Gagal dari Pakasir" });
    }

  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

