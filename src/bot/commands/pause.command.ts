import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

@Injectable()
export class PauseCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'pause',
    description: 'Поставить трек на паузу/убрать с паузы',
  })
  async pause(@Context() [interaction]: SlashCommandContext) {
    await interaction.deferReply();

    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Бот не запущен.')],
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Войдите в канал с ботом.')],
      });
    }

    const track = player.queue.current;

    player.paused ? await player.resume() : await player.pause();

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${track.info.title} от ${track.info.author}**](${track.info.uri}) ${player.paused ? 'поставлен на паузу' : 'убран с паузы'}. `,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
