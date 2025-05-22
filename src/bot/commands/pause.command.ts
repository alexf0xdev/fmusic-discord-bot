import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';

@Injectable()
export class PauseCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'pause',
    description: 'Поставить трек на паузу/убрать с паузы',
  })
  async pause(@Context() [interaction]: SlashCommandContext) {
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

    player.paused ? await player.resume() : await player.pause();

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${currentTrack.info.title} от ${currentTrack.info.author}**](${currentTrack.info.uri}) ${player.paused ? 'поставлен на паузу' : 'убран с паузы'}. `,
    );

    await interaction.reply({ embeds: [embed] });
  }
}
