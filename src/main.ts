import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 8000;
  const app = await NestFactory.create(AppModule);
  console.log(process.env.PORT, 'MAMAR BARIR ABDAR');
  app.setGlobalPrefix('api/v1');
  console.log(`🚀 App running on http://localhost:${PORT}`);
  await app.listen(PORT);
}

bootstrap().catch((err) => {
  console.error('❌ Error during app bootstrap', err);
  process.exit(1); // optional: exit process if boot fails
});
