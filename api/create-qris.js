export default async function handler(req, res) {
  // --- KONFIGURASI PROJECT LU ---
  const API_KEY = "BLTv3xG4QMEmgSO0teA5WCvEQZRA3Wx9"; 
  const PROJECT_ID = "fishit-market"; // Sesuaikan dengan Project ID di dashboard lu

  // LOGIKA CEK STATUS (GET)
  if (req.method === "GET") {
    const { order_id } = req.query;
    try {
      const checkRes = await fetch(`https://app.pakasir.com/api/transaction/check?api_key=${API_KEY}&order_id=${order_id}`);
      const result = await checkRes.json();
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ status: "error", message: "Gagal cek status" });
    }
  }

  // LOGIKA BUAT QRIS (POST)
  if (req.method === "POST") {
    const { amount, order_id } = req.body;
    try {
      const response = await fetch("https://app.pakasir.com/api/transaction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          project_id: PROJECT_ID,
          order_id: order_id,
          amount: amount,
          payment_method: "qris"
        })
      });

      const result = await response.json();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}
