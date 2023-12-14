"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const port = process.env.PORT || 3000;
app.get('/api/status', (req, res) => {
    res.status(200).json({ status: "OK" });
});
app.get("/api/assessments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessments = yield prisma.assessment.findMany();
        res.status(200).json(assessments);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
}));
app.get("/api/students", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const students = yield prisma.student.findMany();
        res.status(200).json(students);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
}));
app.get("/api/classes", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const classes = yield prisma.classe.findMany();
        res.status(200).json(classes);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
}));
app.get("/api/matters", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matters = yield prisma.matter.findMany();
        res.status(200).json(matters);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
}));
app.get("/api/quiz/result", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const quiz = yield prisma.quiz.findMany({
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
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
}));
app.get("/api/quiz/recommendation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        const quiz = yield prisma.quiz.findMany({
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
        const prompt = `
        Matéria | Questão | Nível | Resultado
        ${quiz.map(question => {
            return `${question.Question.Matter.name} | ${question.Question.name} | ${question.Question.level} | ${question.result ? "Acertou" : "Errou"}`;
        })}

        Analisando a tabela acima, o aluno realizou uma prova referente a matéria ${quiz[0].Question.Matter.name}, você poderia recomendar estudos para aluno melhorar os erros que ele cometeu na prova.
    `;
        const recommendation = yield openai.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'gpt-3.5-turbo'
        });
        res.status(200).json(recommendation);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json(error);
        }
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
