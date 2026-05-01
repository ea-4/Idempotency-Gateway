import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.REDIS_URI 

if (!uri) {
  throw new Error("REDIS_URI is not defined in environment variables");
}

const redis = new Redis(uri, {
  connectTimeout: 10000,
});

redis.on("connect", () => console.log("Connected to Redis Cloud"));
redis.on("error", (err: string) => console.error("Redis Client Error", err));

export default redis;
