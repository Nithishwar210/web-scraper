import { DbService } from "../db/db-server";

export class DatabaseLoader {


//     POSTGRES_HOST=localhost
// POSTGRES_USER=nithish
// POSTGRES_PW=W8k5ukGFw4
// POSTGRES_DB=postgres
// POSTGRES_PORT=5434


    static init() {
        DbService.init({
            host: process.env.POSTGRES_HOST || 'localhost',
            user: process.env.POSTGRES_USER || 'admin',
            password: process.env.POSTGRES_PW || 'W8k5ukGFw4',
            database: process.env.POSTGRES_DB || 'postgres',
            port: process.env.POSTGRES_PORT || '5434'
        });
    }
}