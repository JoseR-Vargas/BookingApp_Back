import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

export async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configurar prefijo global /api para todas las rutas excepto la raíz
  app.setGlobalPrefix('api', {
    exclude: ['/', '/health'],
  });

  // Configuración CORS más permisiva para producción
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://booking-app-front-peach.vercel.app']
      : true, // En desarrollo permite cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}

if (require.main === module) {
  bootstrap().catch((error) => {
    console.error('Error fatal al iniciar la aplicación:', error);
    process.exit(1);
  });
}
