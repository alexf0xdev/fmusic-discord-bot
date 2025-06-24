import { NecordLavalinkModule } from '@necord/lavalink';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IntentsBitField } from 'discord.js';
import { NecordModule } from 'necord';
import { BotService } from './bot.service';
import { HelpCommand } from './commands/help.command';
import { PauseCommand } from './commands/pause.command';
import { PlayCommand } from './commands/play.command';
import { PreviousCommand } from './commands/previous.command';
import { QueueCommand } from './commands/queue.command';
import { RemoveCommand } from './commands/remove.command';
import { SeekCommand } from './commands/seek.command';
import { SkipCommand } from './commands/skip.command';
import { StopCommand } from './commands/stop.command';

@Module({
  imports: [
    NecordModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN'),
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildVoiceStates,
        ],
        development:
          configService.get<string>('NODE_ENV') === 'development'
            ? [configService.get<string>('BOT_DEV_GUILD_ID')]
            : undefined,
      }),
    }),
    NecordLavalinkModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const ids = configService.get<string>('LAVALINK_IDS').split(';');
        const hosts = configService.get<string>('LAVALINK_HOSTS').split(';');
        const ports = configService.get<string>('LAVALINK_PORTS').split(';');
        const passwords = configService
          .get<string>('LAVALINK_PASSWORDS')
          .split(';');

        return {
          nodes: ids.map((id, index) => ({
            id,
            host: hosts[index],
            port: +ports[index],
            authorization: passwords[index],
          })),
        };
      },
    }),
  ],
  providers: [
    BotService,
    PlayCommand,
    StopCommand,
    PauseCommand,
    SkipCommand,
    PreviousCommand,
    QueueCommand,
    HelpCommand,
    RemoveCommand,
    SeekCommand,
  ],
})
export class BotModule {}
