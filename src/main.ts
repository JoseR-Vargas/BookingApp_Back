import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar prefijo global /api para todas las rutas excepto la raíz
  app.setGlobalPrefix('api', {
    exclude: ['/', '/health']
  });
  
  // Configuración CORS más permisiva para producción
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://bigligasbeautybarberstudio.netlify.app' ]
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
  }
bootstrap();
