#!/bin/bash

# Simple build script for NeuroFleetX backend

echo "Building NeuroFleetX backend..."

# Check if Maven is installed
if ! command -v mvn &> /dev/null
then
    echo "Maven is not installed. Please install Maven to build the project."
    echo "You can download it from https://maven.apache.org/"
    exit 1
fi

# Build the project
mvn clean package

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "To run the application, use: java -jar target/neurofleetx-lite-0.0.1-SNAPSHOT.jar"
else
    echo "Build failed!"
    exit 1
fi