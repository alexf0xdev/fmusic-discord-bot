import { PlayerManager } from '@necord/lavalink';
import { Injectable, UseFilters } from '@nestjs/common';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ErrorFilter } from '../filters/error.filter';

@Injectable()
@UseFilters(ErrorFilter)
export class SkipCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'skip',
    description: 'Пропустить трек в очереди',
  })
  async skip(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: 'Ошибка' })
        .setDescription('Бот не запущен.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: 'Ошибка' })
        .setDescription('Войдите в канал с ботом.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const currentTrack = player.queue.current;

    if (!currentTrack) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: 'Ошибка' })
        .setDescription('Треков в очереди больше нет.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const nextTrack = player.queue.tracks[player.queue.tracks.length - 1];

    nextTrack ? await player.skip() : await player.stopPlaying();

    const embed = new EmbedBuilder()
      .setColor('#FF8000')
      .setDescription(
        `Трек [**${currentTrack.info.title} от ${currentTrack.info.author}**](${currentTrack.info.uri}) пропущен в очереди.`,
      );

    await interaction.reply({ embeds: [embed] });
  }
}
