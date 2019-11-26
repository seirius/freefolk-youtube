import fs from 'fs';
import { join } from 'path';

export async function writeJson(json: Record<string, any>): Promise<void> {
    console.log(__dirname);
    await fs.promises.writeFile(join('debug', 'out.json'), JSON.stringify(json, null, 2));
}