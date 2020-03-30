import * as env from "env-var";
import { config as envConfig } from "dotenv";
envConfig();

export class RedisConfig {
    public static readonly HOST = env.get("REDIS_HOST", "localhost").asString();
    public static readonly PORT = env.get("REDIS_PORT", "6379").asPortNumber();
    public static readonly CACHE_DB = env.get("REDIS_CACHE_DB", "2").asIntPositive();
    public static readonly ENABLED = env.get("REDIS_ENABLED", "true").asBool();
    public static readonly EXPIRE_TIME = env.get("REDIS_CACHE_EXPIRE_TIME", "86400").asIntPositive();
}