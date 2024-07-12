import { Pool, PoolClient } from 'pg';

interface IDbInit {
    host: string,
    user: string,
    password: string,
    database: string,
    port: string
}

class DBService {

    private pool: Pool | null = null;

    init({ host, user, password, database,port }: IDbInit) {
        console.log({host,user,password,database,port});
        
        this.pool = this.pool = new Pool({
            host,
            user,
            password,
            database,
            port: parseInt(port, 10), // Ensure port is a number
            max: 10,
            idleTimeoutMillis: 30000,
            application_name: 'library_management',
        });

    };

    async getConnection(): Promise<PoolClient> {
        if (!this.pool) {
            throw new Error('Database connection is not initialized.');
        }
        return this.pool.connect();
    }

}

export const DbService = new DBService();
