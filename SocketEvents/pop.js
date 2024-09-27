const SIZE = 20;
const wrapRoll = Array(SIZE).fill().map(() => Array(SIZE).fill(false));

export default {
  event: 'pop',
  execute(objIndices, _, rem) {
    wrapRoll[objIndices.y][objIndices.x] = !wrapRoll[objIndices.y][objIndices.x];
    rem.io.to('BubbleWrap').emit('newState', wrapRoll);
  },
  SIZE,
  wrapRoll
}