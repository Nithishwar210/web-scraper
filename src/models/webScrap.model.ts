import {  QueryResult } from 'pg';
import { DbService } from '../db/db-server';

interface Tag {
    name: string,
    questions: number
    type: string // Assuming tag_type is a string representation
}

interface Question {
    tag_id: number,
    title: string,
    votes?: number,
    views?: number,
    answers?: number,
    detail?: any // Assuming detail is JSONB
}

class WebScrapModel {
    async insertTag(tag: Tag): Promise<QueryResult | null>  {
        const client = await DbService.getConnection()
        
        try {
            const result = await client.query(
                'INSERT INTO scraper.tags (name, type, questions) VALUES ($1, $2,$3) on conflict do nothing RETURNING *',
                [tag.name, tag.type,tag.questions]
            );
            return result;
        } catch(error:any) {
            return null
        }
         finally {
            client.release();
        }
    }

    async insertQuestion(questions: Question[]): Promise<QueryResult | null> {
        const client = await DbService.getConnection()
        
        
        try {

            await client.query('BEGIN');
            
            let result  = null
            for (const question of questions) {
                const queryText = `
                    INSERT INTO scraper.questions (tag_id, title, votes, views, detail)
                    VALUES ($1, $2, $3, $4, $5 ) on conflict (tag_id,title) do nothing
                `;
                const queryParams = [
                    Number(question.tag_id),
                    question.title,
                    Number(question.votes) || 0,
                    Number(question.views) || 0,
                    question.detail ? JSON.stringify(question.detail) : null // Serialize JSONB data
                ];

                result = await client.query(queryText, queryParams);
            }

            await client.query('COMMIT');
            console.log('Bulk insert successful.');

            return result;
        } finally {
            client.release();
        }
    }
}

export const WebScrapModelInstance = new WebScrapModel