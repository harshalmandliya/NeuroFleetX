# Backend Dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy pom.xml and download dependencies
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -f pom.xml

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "target/neurofleetx-lite-0.0.1-SNAPSHOT.jar"]