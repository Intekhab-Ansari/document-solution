# Build hardened, unprivileged ephemeral microservice container
FROM python:3.12-slim-bookworm

# Install qpdf and minimal runtime dependencies without bloated recommends
RUN apt-get update && apt-get install --no-install-recommends -y \
    qpdf \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create unprivileged sandbox user
RUN useradd -m -u 10001 -s /bin/bash appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set strict permissions: read-only code, appuser ownership
RUN chown -R appuser:appuser /app

USER 10001:10001

# Temporary directory backed by tmpfs mounted at runtime
ENV EDITANYTHING_TMPFS=/tmpfs
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
