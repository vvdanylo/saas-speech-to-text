FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx next telemetry disable && npx prisma migrate deploy && npx prisma generate && npm run start"]