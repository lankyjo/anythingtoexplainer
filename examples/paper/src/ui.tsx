// Active style-pack facade. Shot code imports everything from here and never switches style itself;
// config.style picks the pack. Packs live in src/styles/<pack>/.
// Only paper exists so far; instrument and poster add a selector here when they land.
export * from './styles/paper';
