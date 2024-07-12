import express, { Application } from 'express'
import cors from 'cors';

export class ExpressLoader {
    static init():Application {
        const app = express()

        // Middleware that transforms the raw string of req.body into json
        app.use(express.json());
        app.use(cors())
        app.options('*',cors())

        return app;
    };
}
