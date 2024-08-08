const wrapRoll = Array(10).fill().map(() => Array(10).fill(false));

module.exports = {
  event: 'pop',
  execute(objIndices, rem) {
    wrapRoll[objIndices.y][objIndices.x] = !wrapRoll[objIndices.y][objIndices.x];
    rem.io.to('BubbleWrap').emit('newState', wrapRoll);
  },
  wrapRoll
}