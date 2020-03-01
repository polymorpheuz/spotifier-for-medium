const toCode = str => '`' + str + '`';
const toHref = (str, link) => `[${str}](${link})`;

module.exports = {
  toCode,
  toHref,
};
