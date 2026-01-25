# Stage 1: Build the Rust Oxidizer
FROM rust:latest AS rust-builder

WORKDIR /build
# Copy only the necessary parts for the Rust build
COPY apps/oxidizer ./apps/oxidizer

WORKDIR /build/apps/oxidizer
RUN cargo build --release

# Stage 2: Final Worker Image
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from the worker directory
COPY apps/worker/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker application code
COPY apps/worker/ .

# Copy the built Rust binary from Stage 1
# The worker expects it at apps/oxidizer/target/release/oxidizer
RUN mkdir -p apps/oxidizer/target/release/
COPY --from=rust-builder /build/apps/oxidizer/target/release/oxidizer apps/oxidizer/target/release/

# Ensure binary is executable
RUN chmod +x apps/oxidizer/target/release/oxidizer

# Create sandbox directory
RUN mkdir -p /tmp/repolens-sandboxes

# Run worker
CMD ["python", "worker.py"]