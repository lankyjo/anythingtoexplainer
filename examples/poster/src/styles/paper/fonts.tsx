// Paper fonts: Manrope (OFL, see public/fonts/OFL-Manrope.txt), weights 100-900.
// Mounted once at the top of the composition; delayRender keeps frames waiting until glyphs load.
import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const FAMILIES: Array<[string, string, string]> = [['Manrope', 'fonts/Manrope.ttf', '100 900']];

// Side effect during the first render pass, no useEffect (the project bans it in components).
const MountOnce: React.FC<{run: () => void}> = ({run}) => {
  React.useState(() => {
    run();
    return true;
  });
  return null;
};

export const PaperFonts: React.FC = () => {
  const [handle] = React.useState(() => delayRender('paper-fonts'));
  return (
    <MountOnce
      run={() => {
        Promise.all(
          FAMILIES.map(([name, file, weight]) =>
            new FontFace(name, `url(${staticFile(file)})`, {weight} as FontFaceDescriptors).load(),
          ),
        )
          .then((fs) => {
            fs.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
            continueRender(handle);
          })
          .catch(() => continueRender(handle));
      }}
    />
  );
};
