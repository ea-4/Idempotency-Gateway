import express from "express";
import { idempotencyMiddleware } from "./middleware/idempotency.js";
import type { PaymentRequest } from "./types.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/process-payment", idempotencyMiddleware, async (req, res) => {
  const { amount, currency }: PaymentRequest = req.body;
  if (!amount || !currency) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return res.status(201).json({
      status: "Payment Successful",
      message: `Charged ${amount} ${currency}`,
    });
  } catch (error) {
    return res.status(500).json({ error: "Payment processing failed" });
  }
});

app.listen(PORT, () => {
  console.log(`FinSafe Idempotency Gateway running on port ${PORT}`);
});
