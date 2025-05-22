import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';

@Injectable()
export class SkipCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'skip',
    description: 'Пропустить трек в очереди',
  })
  async skip(@Context() [interaction]: SlashCommandContext) {
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

    const currentTrack = player.queue.current;

    if (!currentTrack) {
      const embed = ERROR_EMBED().setDescription(
        'Треков в очереди больше нет.',
      );

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const nextTrack = player.queue.tracks[player.queue.tracks.length - 1];

    nextTrack ? await player.skip() : await player.stopPlaying();

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${currentTrack.info.title} от ${currentTrack.info.author}**](${currentTrack.info.uri}) пропущен в очереди.`,
    );

    await interaction.reply({ embeds: [embed] });
  }
}
