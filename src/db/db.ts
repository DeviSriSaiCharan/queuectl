import "reflect-metadata";
import { DataSource } from "typeorm";
import { Job } from "./entities/jobs.entity.js";

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "queuectl.db",
  synchronize: true,
  logging: false,
  entities: [Job],
});

export async function initializeDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}
