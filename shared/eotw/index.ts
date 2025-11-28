let id = 0;
export class EotwCard {
  id: number;
  image: string;
  description: string;
  constructor(description: string) {
    this.id = ++id;
    this.image = `/images/eotw/${this.id}.png`;
    this.description = description;
  }
}

const EotwDescriptions = [
  'All trees have gained the ability to uproot themselves and are building spaceships to leave earth.',
  'All leading members of government and industry have turned into babies.',
  'Cats and dogs have gotten over their differences and are beginning an assault on mankind.',
  'Stuffed animals have become animate and are scaring mean children.',
  'All pets have fallen asleep on their owners, rendering them immobile.',
  /* 5 */
  'All mailed goods are showing up at the wrong houses.',
  'Overdue homework Is getting revenge by eating dogs.',
  "Grass everywhere is tired of being stepped on and has moved to people's roofs.",
  'All smokestacks have turned into volcanoes.',
  'All livestock have disappeared, leaving many hungry for chicken nuggies and hamburgers.',
  /* 10 */
  'Mirrors are reflecting people’s most embarrassing moments.',
  'Feet are now 11 inches instead of 12, causing all buildings made with the metric system to shrink.',
  'Humans have evolved a tolerance to caffeine and can no longer wake up in the morning.',
  'Paintings have turned into portals and people are being pulled in.',
  'Too many people are tickling the earth, causing it to begin invertin.',
  /* 15 */
];

const EotwCards = EotwDescriptions.map((d) => new EotwCard(d));

export function getRandomEotwCard() {
  const randomId = Math.floor(Math.random() * EotwCards.length);
  return EotwCards[randomId];
}

export function getEotwCardFromId(id: number) {
  return EotwCards[id];
}
