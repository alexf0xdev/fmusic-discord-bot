import { Injectable, UseFilters } from '@nestjs/common';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ErrorFilter } from '../filters/error.filter';

@Injectable()
@UseFilters(ErrorFilter)
export class HelpCommand {
  @SlashCommand({
    name: 'help',
    description: 'Помощь по командам',
  })
  async help(@Context() [interaction]: SlashCommandContext) {
    const embed = new EmbedBuilder()
      .setColor('#FF8000')
      .setAuthor({ name: 'Помощь по командам' })
      .setDescription(
        '</play:1373748231938510959> - поиск трека по ссылке/названию\n</stop:1373748231938510960> - очистить очередь треков и отключить бота\n</pause:1373748231938510961> - поставить трек на паузу/убрать с паузы\n</queue:1373748231938510964> - показать очередь треков\n</skip:1373748231938510962> - пропустить трек в очереди\n</previous:1374043747226226769> - включить предыдущий трек',
      );

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }
}
