# Use official Bun image
FROM oven/bun:1.2.22

# Set working directory
WORKDIR /app

# Copy project files
COPY . ./

# Install dependencies
RUN bun install

# Build React frontend into /public
RUN bun run build.ts

# Expose HTTP (for admin panel) and DNS (port 53)
EXPOSE 3000 53/udp

# Start the Bun server (which serves API + frontend + DNS engine)
CMD ["bun", "run", "src/server.ts"]