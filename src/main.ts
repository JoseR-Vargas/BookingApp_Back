import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:5500', 
      'http://127.0.0.1:5500', 
      'http://localhost:3000',
      'https://booking-app-d3v.netlify.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend corriendo en puerto ${port}`);
  console.log(`📊 API disponible en /api/bookings`);
  console.log(`🌐 CORS configurado para: https://booking-app-d3v.netlify.app`);
}
bootstrap();
