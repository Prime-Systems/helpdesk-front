# Stage 1: Build the Vue app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This step "bakes in" your .env.production variables
RUN npm run build

# Stage 2: Create the final server image
FROM node:18-alpine
WORKDIR /app
# Install the 'serve' static server
RUN npm install -g serve
# Copy *only* the built app from the builder stage
COPY --from=builder /app/dist ./dist

# The 'serve' command will run on port 5173 inside the container
EXPOSE 5173

# Command to run the app
# -s handles SPA (Vue Router) history mode
# -l 5173 listens on port 5173
CMD [ "serve", "-s", "dist", "-l", "5173" ]