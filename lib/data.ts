import fs from "fs";
import path from "path";
import type { Item, Photo, Request, Settings } from "./types";

const dataDir = path.join(process.cwd(), "data");

function readJSON<T>(filePath: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); }
  catch { return fallback; }
}

function writeJSON<T>(filePath: string, data: T): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const getItems    = () => readJSON<Item[]>   (path.join(dataDir, "items.json"),    []);
export const saveItems   = (d: Item[])    => writeJSON(path.join(dataDir, "items.json"), d);

export const getPhotos   = () => readJSON<Photo[]>  (path.join(dataDir, "photos.json"),   []);
export const savePhotos  = (d: Photo[])   => writeJSON(path.join(dataDir, "photos.json"), d);

export const getRequests  = () => readJSON<Request[]>(path.join(dataDir, "requests.json"), []);
export const saveRequests = (d: Request[]) => writeJSON(path.join(dataDir, "requests.json"), d);

export const getSettings  = () => readJSON<Settings> (path.join(dataDir, "settings.json"), { pickupSlots: [] });
export const saveSettings = (d: Settings) => writeJSON(path.join(dataDir, "settings.json"), d);
