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
    try {
        const assessments = await prisma.assessment.findMany();
        res.status(200).json(assessments);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
});

app.get("/api/students", async (req: Request, res: Response) => {
    try {
        const students = await prisma.student.findMany();
        res.status(200).json(students);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
});

app.get("/api/classes", async (req: Request, res: Response) => {
    try {
        const classes = await prisma.classe.findMany();
        res.status(200).json(classes);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
});

app.get("/api/matters", async (req: Request, res: Response) => {
    try {
        const matters = await prisma.matter.findMany();
        res.status(200).json(matters);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
});

app.get("/api/quiz/result", async (req: Request<null, null, null, QuizResultQuery>, res: Response) => {
    try {
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
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
});

app.get("/api/quiz/recommendation", async (req: Request<null, null, null, QuizResultQuery>, res: Response) => {
    try {
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

        const totals = {
            hits: quiz.filter(item => item.result === true).length,
            errors: quiz.filter(item => item.result === false).length,
        }

        const prompt = `
            Matéria | Questão | Nível | Resultado
            ${quiz.map(question => {
                return `${question.Question.Matter.name} | ${question.Question.name} | ${question.Question.level} | ${question.result ? "Acertou" : "Errou"}`
            })
                }

            Analisando a tabela acima, o aluno realizou uma prova referente a matéria ${quiz[0].Question.Matter.name}, você poderia recomendar estudos para aluno melhorar os erros que ele cometeu na prova em realação as questões, compartilhe um resumo, descreva de forma de um artigo. não informar um titulo referente ao artigo.
        `;

        const recommendation = await openai.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'gpt-4'
        });

        res.status(200).json({
            recommendation: {
                message: recommendation.choices[0].message.content
            },
            totals
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});