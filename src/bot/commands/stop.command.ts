import { PlayerManager } from '@necord/lavalink';
import { Injectable, UseFilters } from '@nestjs/common';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ErrorFilter } from '../filters/error.filter';

@Injectable()
@UseFilters(ErrorFilter)
export class StopCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'stop',
    description: 'Очистить очередь треков и отключить бота',
  })
  async stop(@Context() [interaction]: SlashCommandContext) {
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

    await player.destroy();

    const embed = new EmbedBuilder()
      .setColor('#FF8000')
      .setDescription('Очередь треков очищена, бот отключен.');

    await interaction.reply({ embeds: [embed] });
  }
}
