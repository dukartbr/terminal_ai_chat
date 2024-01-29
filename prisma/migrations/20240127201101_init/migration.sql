-- CreateTable
CREATE TABLE "ChatLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datetime" DATETIME NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT NOT NULL
);
