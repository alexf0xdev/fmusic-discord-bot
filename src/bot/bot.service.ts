import {
  LavalinkManagerContextOf,
  NodeManagerContextOf,
  OnLavalinkManager,
  OnNodeManager,
  PlayerManager,
} from '@necord/lavalink';
import { Injectable, Logger } from '@nestjs/common';
import { Collection, GuildManager } from 'discord.js';
import { Context, ContextOf, On, Once } from 'necord';
import { MAIN_EMBED } from './bot.constants';

@Injectable()
export class BotService {
  constructor(
    private guildManager: GuildManager,
    private playerManager: PlayerManager,
  ) {}

  private logger = new Logger(BotService.name);

  private timeouts = new Collection<string, NodeJS.Timeout>();

  @Once('ready')
  async onReady(@Context() [client]: ContextOf<'ready'>) {
    this.logger.log(`Bot logged in as ${client.user.username}`);
  }

  @On('warn')
  onWarn(@Context() [info]: ContextOf<'warn'>) {
    this.logger.warn(info);
  }

  @On('error')
  onError(@Context() [error]: ContextOf<'error'>) {
    this.logger.error(error);
  }

  @OnNodeManager('connect')
  onReadyLavalink(@Context() [node]: NodeManagerContextOf<'connect'>) {
    this.logger.log(`Node: ${node.options.id} connected`);
  }

  @OnLavalinkManager('playerCreate')
  onPlayerCreate(@Context() [player]: LavalinkManagerContextOf<'playerCreate'>) {
    this.logger.log(`Player created at ${player.guildId}`);
  }

  @OnLavalinkManager('playerDestroy')
  onPlayerDestroy(@Context() [player]: LavalinkManagerContextOf<'playerDestroy'>) {
    this.logger.log(`Player destroy at ${player.guildId}`);

    const timeout = this.timeouts.get(player.guildId);

    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(player.guildId);
    }
  }

  @OnLavalinkManager('trackStart')
  async onTrackStart(@Context() [player]: LavalinkManagerContextOf<'trackStart'>) {
    const timeout = this.timeouts.get(player.guildId);

    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(player.guildId);
    }
  }

  @OnLavalinkManager('queueEnd')
  async onQueueEnd(@Context() [player]: LavalinkManagerContextOf<'queueEnd'>) {
    const timeout = this.timeouts.get(player.guildId);

    if (timeout) this.timeouts.delete(player.guildId);

    const newTimeout = setTimeout(async () => {
      await player.destroy();

      const guild = this.guildManager.cache.get(player.guildId);

      const textChannel = guild.channels.cache.get(player.textChannelId);

      if (!textChannel.isTextBased()) return;

      const embed = MAIN_EMBED().setDescription(
        'За последние 5 минут не воспроизводилось ни одного трека - бот отключен.',
      );

      await textChannel.send({ embeds: [embed] });
    }, 300000);

    this.timeouts.set(player.guildId, newTimeout);
  }

  @On('voiceStateUpdate')
  async onVoiceStateUpdate(@Context() [oldState, newState]: ContextOf<'voiceStateUpdate'>) {
    const voiceChannel = oldState.channel ?? newState.channel;

    const voiceChannelMembers = voiceChannel.members.filter((member) => !member.user.bot);

    if (!voiceChannelMembers.size) {
      const player = this.playerManager.get(voiceChannel.guildId);

      if (!player || voiceChannel.id !== player.voiceChannelId) return;

      await player.destroy();

      const textChannel = voiceChannel.guild.channels.cache.get(player.textChannelId);

      if (!textChannel.isTextBased()) return;

      const embed = MAIN_EMBED().setDescription('В канале с ботом никого нет - бот отключен.');

      await textChannel.send({ embeds: [embed] });
    }
  }
}
