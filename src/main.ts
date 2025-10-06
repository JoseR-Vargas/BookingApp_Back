import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar prefijo global /api
  app.setGlobalPrefix('api');
  
  // Configuración CORS más permisiva para producción
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://booking-app-d3v.netlify.app', 'http://localhost:5500', 'http://127.0.0.1:5500']
      : true, // En desarrollo permite cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  
  app.enableCors(corsOptions);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Backend corriendo en puerto ${port}`);
  console.log(`📊 API disponible en /api/bookings`);
  console.log(`🌐 CORS configurado para producción`);
  console.log(`🔧 Modo:`, process.env.NODE_ENV || 'development');
}
bootstrap();
