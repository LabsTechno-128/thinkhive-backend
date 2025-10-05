import { ConfigService } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import { DatabaseConfig } from './typeOrm.config.type';
export default (
  configService: ConfigService<DatabaseConfig>,
): DataSourceOptions => {
  return {
    type: 'postgres',
    host: configService.getOrThrow<string>('DB_HOST'), // strongly typed
    port: configService.getOrThrow<number>('DB_PORT'),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  };
};
