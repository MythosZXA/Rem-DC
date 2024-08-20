const wrapRoll = Array(20).fill().map(() => Array(20).fill(false));

export default {
  event: 'pop',
  execute(objIndices, _, rem) {
    wrapRoll[objIndices.y][objIndices.x] = !wrapRoll[objIndices.y][objIndices.x];
    rem.io.to('BubbleWrap').emit('newState', wrapRoll);
  },
  wrapRoll
}