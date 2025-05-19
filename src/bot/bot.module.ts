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
import { SkipCommand } from './commands/skip.command';
import { StopCommand } from './commands/stop.command';

@Module({
  imports: [
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('BOT_TOKEN'),
        intents: [
          IntentsBitField.Flags.Guilds,
          IntentsBitField.Flags.GuildVoiceStates,
          IntentsBitField.Flags.GuildMessages,
          IntentsBitField.Flags.GuildMessageReactions,
          IntentsBitField.Flags.MessageContent,
          IntentsBitField.Flags.DirectMessages,
        ],
        development: [configService.get<string>('DISCORD_DEV_GUILD_ID')],
      }),
    }),
    NecordLavalinkModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        nodes: [
          {
            authorization: configService.get<string>('LAVALINK_PASSWORD'),
            host: configService.get<string>('LAVALINK_HOST'),
            port: +configService.get<number>('LAVALINK_PORT'),
            id: 'main_node',
          },
        ],
      }),
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
  ],
})
export class BotModule {}
