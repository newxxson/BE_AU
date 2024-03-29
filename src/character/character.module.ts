import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Character, CharacterSchema } from 'src/schemas/character.schema';
import { CharacterController } from './character.controller';
import { CharacterService } from './character.service';
import { CharacterRepository } from 'src/repository/character.repository';
import { AuthModule } from 'src/auth/auth.module';
import {
  CharacterCreation,
  CharacterCreationSchema,
} from 'src/schemas/character-creation.schema';
import { CharacterCreationRepository } from 'src/repository/character-creation.repository';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
      { name: CharacterCreation.name, schema: CharacterCreationSchema },
    ]),
  ],
  controllers: [CharacterController],
  providers: [
    CharacterService,
    CharacterRepository,
    CharacterCreationRepository,
  ],
})
export class CharacterModule {}
