export interface Record {
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  bodyHash: string;
  response?: {
    body: any;
    statusCode: number;
  };
}

export interface PaymentRequest {
  amount: number;
  currency: string;
}
