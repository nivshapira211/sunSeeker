FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Make sure uploads directory exists
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
