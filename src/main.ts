import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS para permitir peticiones del frontend (local y producción)
  app.enableCors({
    origin: [
      'http://localhost:5500', 
      'http://127.0.0.1:5500', 
      'http://localhost:3000',
      'https://booking-app-d3v.netlify.app' // URL de producción
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend corriendo en http://localhost:${port}`);
  console.log(`📊 API disponible en http://localhost:${port}/api/bookings`);
  console.log(`🌐 CORS configurado para producción: https://booking-app-d3v.netlify.app`);
}
bootstrap();
