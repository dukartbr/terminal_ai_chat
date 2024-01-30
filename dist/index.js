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
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env["OPENAI_API_KEY"],
});
const prisma = new client_1.PrismaClient();
const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});
function getAIResponse(question) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            messages: [{ role: "user", content: question }],
            model: "gpt-3.5-turbo",
        };
        const chatCompletion = yield openai.chat.completions.create(params);
        return chatCompletion.choices[0].message.content;
    });
}
function getLogs() {
    return __awaiter(this, void 0, void 0, function* () {
        const logs = yield prisma.chatLog.findMany();
        return logs;
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let dots = '';
        readline.question("How can I help?\n", (question) => __awaiter(this, void 0, void 0, function* () {
            if (question === "getlogs") {
                const logs = yield getLogs();
                const res = logs.map(({ question, response }) => `${question} | ${response.slice(0, 100)}${response.length > 100 ? "..." : ""}`);
                console.log(res);
                readline.close();
            }
            else {
                const interval = setInterval(() => {
                    process.stdout.write('.');
                    dots += '.';
                    if (dots.length === 3) {
                        process.stdout.clearLine(0);
                        process.stdout.cursorTo(0);
                        dots = '';
                    }
                }, 500);
                const aiResponse = yield getAIResponse(question);
                yield prisma.chatLog.create({
                    data: {
                        datetime: new Date(),
                        question,
                        response: aiResponse !== null && aiResponse !== void 0 ? aiResponse : "!NO RESPONSE FROM ENDPOINT!",
                    },
                });
                setTimeout(() => {
                    clearInterval(interval);
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    console.log("===================\n" + aiResponse);
                    readline.close();
                    return;
                }); // Replace 5000 with the actual time it takes for the API to respond
            }
        }));
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
