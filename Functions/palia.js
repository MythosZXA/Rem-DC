const { secsToMidnight } = require('./specialDaysFunctions.js');

function setupResetTimer(rem) {
	// Setup reset timer if the day hasn't reset
	if (secsToMidnight() >= ((60 * 60 * 2))) {
		setTimeout(() => {
			const dayOfWeek = new Date().getDay();
	
			rem.remDB.get('palia_gifts').forEach(giftInfo => {
				// Reset daily
				giftInfo['gifted'] = 0;
	
				// Reset weekly if sunday
				if (dayOfWeek === 0) {
					['gift1','gift2','gift3','gift4'].forEach(gift => giftInfo[gift] = 0);
				}
			});
		}, 1000 * (secsToMidnight() - (60 * 60 * 2))); // Two hours before midnight CST (9pm PST)
	}
	// Setup reset timer when tomorrow comes
	else {
		setTimeout(() => {
			setupResetTimer(rem);
		}, 1000 * (secsToMidnight() + 60));
	}
}

module.exports = {
	setupResetTimer
};