import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const prisma = new PrismaClient();
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function getAIResponse(question: string) {
  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [{ role: "user", content: question }],
    model: "gpt-3.5-turbo",
  };
  const chatCompletion: OpenAI.Chat.ChatCompletion =
    await openai.chat.completions.create(params);
  return chatCompletion.choices[0].message.content;
}

async function getLogs() {
  const logs = await prisma.chatLog.findMany();
  return logs;
}

async function main() {
  readline.question("How can I help?\n", async (question: string) => {
    if (question === "getlogs") {
      const logs = await getLogs();
      const res = logs.map(
        ({ question, response }): string =>
          `${question} | ${response.slice(0, 100)}${
            response.length > 100 ? "..." : ""
          }`
      );
      console.log(res);
      readline.close();
    } else {
      const aiResponse = await getAIResponse(question);
      await prisma.chatLog.create({
        data: {
          datetime: new Date(),
          question,
          response: aiResponse ?? "!NO RESPONSE FROM ENDPOINT!",
        },
      });
      console.log("===================\n" + aiResponse);
      readline.close();
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
