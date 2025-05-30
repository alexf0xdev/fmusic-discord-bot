import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import {
  Context,
  IntegerOption,
  Options,
  SlashCommand,
  SlashCommandContext,
} from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';

export class RemoveCommandOptions {
  @IntegerOption({
    name: 'айди_трека',
    description: 'Айди трека из очереди',
    required: true,
    min_value: 2,
  })
  trackId: number;
}

@Injectable()
export class RemoveCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'remove',
    description: 'Убрать трек из очереди',
  })
  async remove(
    @Context() [interaction]: SlashCommandContext,
    @Options() { trackId }: RemoveCommandOptions,
  ) {
    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      const embed = ERROR_EMBED().setDescription('Бот не запущен.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      const embed = ERROR_EMBED().setDescription('Войдите в канал с ботом.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const index = trackId - 2;

    const removedTrack = player.queue.tracks[index];

    if (!removedTrack) {
      const embed = ERROR_EMBED().setDescription('Трек не найден.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    await player.queue.remove(index);

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${removedTrack.info.title} от ${removedTrack.info.author}**](${removedTrack.info.uri}) убран из очереди.`,
    );

    await interaction.reply({ embeds: [embed] });
  }
}
