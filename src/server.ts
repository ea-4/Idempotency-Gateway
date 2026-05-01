import express from "express";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/process-payment", async (req, res) => {
  const { amount, currency } = req.body;

  await new Promise((resolve) => setTimeout(resolve, 2000));

  return res.status(201).json({
    status: "Payment Successful",
    message: `Charged ${amount} ${currency}`,
  });
});

app.listen(PORT, () => {
  console.log(`FinSafe Idempotency Gateway running on port ${PORT}`);
});
