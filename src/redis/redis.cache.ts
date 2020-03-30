import { RedisClient, createClient } from "redis";
import { RedisConfig } from "../config/RedisConfig";
import { createHash } from "crypto";
import { rejects } from "assert";

function createKey({
    className, methodName, args,
}: {
    className: string;
    methodName: string;
    args: any[];
}): string {
    let argsHashed = args ? createHash("md5")
        .update(JSON.stringify(args))
        .digest("hex") : "empty";
    return [className, methodName, argsHashed].join(":");
}

class RedisCache {

    public cacheClient: RedisClient;

    constructor() {
        if (RedisConfig.ENABLED) {
            this.cacheClient = createClient({
                host: RedisConfig.HOST,
                port: RedisConfig.PORT,
                db: RedisConfig.CACHE_DB
            });
        }
    }

    public cache() {
        const redisCache = this;
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
            if (!RedisConfig.ENABLED) {
                return descriptor;
            }
            const method = descriptor.value;
            descriptor.value = async function(...args: any[]) {
                const key = createKey({
                    className: target.constructor.name,
                    methodName: propertyKey,
                    args,
                });
                const cacheExists = await redisCache.cacheExists(key);
                if (cacheExists) {
                    return await redisCache.getCachedReturn(key);
                } else {
                    const response = await method.apply(target, args);
                    await redisCache.setCachedReturn(key, response);
                    return response;
                }
            };
            return descriptor;
        }
    }

    private getCachedReturn(key: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.cacheClient.get(key, (err: Error, value: string) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    private setCachedReturn(key: string, response: any): Promise<void> {
        return new Promise((resolve, reject) => {
            const stringifiedResponse = response ? JSON.stringify(response) : "";
            this.cacheClient.setex(key, RedisConfig.EXPIRE_TIME, stringifiedResponse, (err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private cacheExists(key: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.cacheClient.exists(key, (err: Error, exists: number) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!exists);
                }
            });
        });
    }

}

export const CACHE = new RedisCache();
