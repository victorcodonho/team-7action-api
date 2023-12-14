import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { QuizResultQuery } from './types/quiz.types';

dotenv.config();

const prisma = new PrismaClient();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

app.get('/api/status', (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" });
});

app.get("/api/assessments", async (req: Request, res: Response) => {
    const assessments = await prisma.assessment.findMany();
    res.status(200).json(assessments);
});

app.get("/api/students", async (req: Request, res: Response) => {
    const students = await prisma.student.findMany();
    res.status(200).json(students);
});

app.get("/api/classes", async (req: Request, res: Response) => {
    const classes = await prisma.classe.findMany();
    res.status(200).json(classes);
});

app.get("/api/matters", async (req: Request, res: Response) => {
    const matters = await prisma.matter.findMany();
    res.status(200).json(matters);
});

app.get("/api/quiz/result", async (req: Request<null, null, null, QuizResultQuery>, res: Response) => {

    const query = req.query;

    const quiz = await prisma.quiz.findMany({
        where: {
            studentId: Number(query.studentId),
            assessmentId: Number(query.assessmentId),
            Question: {
                matterId: Number(query.matterId)
            },
            Student: {
                classeId: Number(query.classeId)
            }
        },
        include: {
            Student: true,
            Question: {
                include: {
                    Matter: true
                }
            },
            Assessment: true
        }
    });

    res.status(200).json(quiz);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});