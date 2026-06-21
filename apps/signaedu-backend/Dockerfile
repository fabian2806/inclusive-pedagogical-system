# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests clean package

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# El host (Railway) inyecta PORT; la app lo lee via server.port=${PORT:8080}.
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
