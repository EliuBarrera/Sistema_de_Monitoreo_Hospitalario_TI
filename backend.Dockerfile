FROM python:3.11-slim

# Install system dependencies if required by psycopg2 or other packages
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# The CMD will be overridden in docker-compose.yml for each service
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0"]
