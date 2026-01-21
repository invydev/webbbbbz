export default async function handler(req, res) {
  // Headernya kita paksa biar gak ada alasan CORS error
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const MY_API_KEY = "BLTv3xG4QMEmgSO0teA5WCvEQZRA3Wx9";
  const MY_PROJECT_ID = "fishit-market";

  // LOGIKA CEK STATUS (GET)
  if (req.method === 'GET') {
    const { order_id } = req.query;
    if (!order_id) return res.status(400).json({ error: "Order ID mana bang?" });

    try {
      const checkStatus = await fetch(`https://app.pakasir.com/api/transaction/check?api_key=${MY_API_KEY}&order_id=${order_id}`);
      const hasil = await checkStatus.json();
      return res.status(200).json(hasil);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // LOGIKA BUAT QRIS (POST)
  if (req.method === 'POST') {
    try {
      const { amount, order_id } = req.body;

      if (!amount || !order_id) {
        return res.status(400).json({ error: "Data kurang lengkap!" });
      }

      const bikinQris = await fetch("https://app.pakasir.com/api/transaction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: MY_API_KEY,
          project_id: MY_PROJECT_ID,
          order_id: order_id,
          amount: parseInt(amount),
          payment_method: "qris"
        })
      });

      const dataQris = await bikinQris.json();
      return res.status(200).json(dataQris);
    } catch (err) {
      return res.status(500).json({ error: "Server Error: " + err.message });
    }
  }
}
