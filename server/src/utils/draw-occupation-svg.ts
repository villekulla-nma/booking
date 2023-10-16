interface Options {
  occupied: boolean;
  upcoming: {
    dateTime: string;
    unit: string;
  }[];
}

const outerTemplate = (
  caption: string,
  table: string
) => /* svg */ `<?xml version="1.0" encoding="utf-8"?>
<svg height="480" width="800" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg">
  <style type="text/css">
    * {
      fill: black;
      font-family: sans-serif;
    }

    .caption {
      font-size: 160px;
    }

    .text {
      font-size: 24px;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
  <rect x="20" y="20" width="760" height="4" />

  <!-- Caption -->
  <text x="20" y="84" class="caption" dominant-baseline="hanging">
    ${caption}
  </text>

  <!-- Upcoming occupations -->
  ${table}

  <rect x="20" y="456" width="760" height="4" />
</svg>`;

export const drawOccupationSvg = ({ occupied, upcoming }: Options) => {
  const caption = occupied ? 'Belegt' : 'Frei';
  const table = upcoming.map(
    ({ dateTime, unit }, i) => /* svg */ `
<rect x="20" y="${308 + 50 * i}" width="762" height="2" />
<text x="20" y="${324 + 50 * i}" class="text" dominant-baseline="hanging">
  ${dateTime}
</text>
<text x="400" y="${324 + 50 * i}" class="text" dominant-baseline="hanging">
  ${unit}
</text>`
  );

  return outerTemplate(caption, table.join(''));
};
