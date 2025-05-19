import {
  LavalinkManagerContextOf,
  NodeManagerContextOf,
  OnLavalinkManager,
  OnNodeManager,
} from '@necord/lavalink';
import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { ActivityType } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { ErrorFilter } from './filters/error.filter';

@Injectable()
@UseFilters(ErrorFilter)
export class BotService {
  private logger = new Logger(BotService.name);

  @Once('ready')
  public async onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);

    client.user.setActivity('/help', { type: ActivityType.Listening });
  }

  @On('warn')
  public onWarn(@Context() [message]: ContextOf<'warn'>) {
    this.logger.warn(message);
  }

  @OnNodeManager('connect')
  public onReadyLavalink(@Context() [node]: NodeManagerContextOf<'connect'>) {
    this.logger.log(`Node: ${node.options.id} Connected`);
  }

  @OnLavalinkManager('playerCreate')
  public onPlayerCreate(
    @Context() [player]: LavalinkManagerContextOf<'playerCreate'>,
  ) {
    this.logger.log(`Player created at ${player.guildId}`);
  }
}
