# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum* ./

# Copy source for go mod tidy
COPY *.go ./

# Download dependencies and generate go.sum
RUN go mod tidy && go mod download

# Copy remaining source code (if any additional files)
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o load-go .

# Runtime stage
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates curl

# Copy binary from builder
COPY --from=builder /app/load-go .

# Expose port
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Run the binary
CMD ["./load-go"]
