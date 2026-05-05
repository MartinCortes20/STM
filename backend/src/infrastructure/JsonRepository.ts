import fs from 'fs';
import path from 'path';
import { Worker } from '../domain/Worker';

// Vercel serverless: /tmp is writable but ephemeral per-instance
const DB_PATH = process.env.VERCEL
  ? '/tmp/db.json'
  : path.join(__dirname, '../../data/db.json');

interface Database {
  workers: Worker[];
}

function readDB(): Database {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '{"workers":[]}', 'utf-8');
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDB(data: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const JsonRepository = {
  getWorkers(): Worker[] {
    return readDB().workers;
  },

  getWorkerById(id: string): Worker | undefined {
    return readDB().workers.find(w => w.id === id);
  },

  saveWorker(worker: Worker): Worker {
    const db = readDB();
    db.workers.push(worker);
    writeDB(db);
    return worker;
  },

  updateWorker(worker: Worker): Worker {
    const db = readDB();
    const idx = db.workers.findIndex(w => w.id === worker.id);
    if (idx === -1) throw new Error('Worker not found');
    db.workers[idx] = worker;
    writeDB(db);
    return worker;
  },

  deleteWorker(id: string): void {
    const db = readDB();
    db.workers = db.workers.filter(w => w.id !== id);
    writeDB(db);
  },
};
