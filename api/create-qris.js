export default async function handler(req, res) {
  // Tambahin Header CORS biar gak diblokir browser
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const API_KEY = "BLTv3xG4QMEmgSO0teA5WCvEQZRA3Wx9"; 
  const PROJECT_ID = "fishit-market"; 

  // --- LOGIKA CEK STATUS (GET) ---
  if (req.method === "GET") {
    const { order_id } = req.query;
    if (!order_id) return res.status(400).json({ error: "Order ID kosong" });

    try {
      const checkRes = await fetch(`https://app.pakasir.com/api/transaction/check?api_key=${API_KEY}&order_id=${order_id}`);
      const result = await checkRes.json();
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ status: "error", msg: e.message });
    }
  }

  // --- LOGIKA BUAT QRIS (POST) ---
  if (req.method === "POST") {
    const { amount, order_id } = req.body;

    if (!amount || !order_id) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    try {
      const response = await fetch("https://app.pakasir.com/api/transaction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: API_KEY,
          project_id: PROJECT_ID,
          order_id: order_id,
          amount: parseInt(amount),
          payment_method: "qris"
        })
      });

      const data = await response.json();
      
      // Kirim balik ke frontend
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: "Gagal konek ke Pakasir: " + err.message });
    }
  }
}
