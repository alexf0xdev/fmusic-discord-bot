import { PlayerManager } from '@necord/lavalink';
import { Injectable, UseFilters } from '@nestjs/common';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ErrorFilter } from '../filters/error.filter';

@Injectable()
@UseFilters(ErrorFilter)
export class PauseCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'pause',
    description: 'Поставить трек на паузу/убрать с паузы',
  })
  async pause(@Context() [interaction]: SlashCommandContext) {
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

    player.paused ? await player.resume() : await player.pause();

    const embed = new EmbedBuilder()
      .setColor('#FF8000')
      .setDescription(
        `Трек [**${currentTrack.info.title} от ${currentTrack.info.author}**](${currentTrack.info.uri}) ${player.paused ? 'поставлен на паузу' : 'убран с паузы'}. `,
      );

    await interaction.reply({ embeds: [embed] });
  }
}
