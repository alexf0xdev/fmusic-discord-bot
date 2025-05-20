import { EmbedBuilder } from 'discord.js';

export const MAIN_EMBED = () => new EmbedBuilder().setColor('#FF8000');

export const ERROR_EMBED = () =>
  new EmbedBuilder().setColor('#ff0000').setAuthor({ name: 'Ошибка' });
