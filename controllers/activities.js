const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'), { multiArgs: true });

const activities = {
  // 1-point activities
  'Air hockey/foosball': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Baseball/softball': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Bowling': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Croquet': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Curling/shuffleboard': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Driving range': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Golf (with cart)': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Playing catch': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Stretching': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Table tennis': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Walking (casual pace)': {
    category: 'Activities'
    points: 1,
		timeChunk: {value: 20, unit: 'minutes'}}
  },

  // 2-point Activities
  'Aerobics/Tai Chi/Pilates/Yoga': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Biking (casual pace)': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Calisthenics/gymnastics': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Kayaking/canoeing': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Dancing/Zumba': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Golf (walking the course)': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Hiking (hills)': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Hula hooping': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Horseback riding': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Ice skating/roller blading': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Power walking': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Situps or pushups': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Team sports (casual) (soccer, etc.)': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Tennis (doubles)': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Weight training': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Yard work': {
    category: 'Activities'
    points: 2,
		timeChunk: {value: 20, unit: 'minutes'}}
  },

  // 3-point Activities
  'Advanced cardio (CrossFit, etc.)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Biking (fast pace)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Elliptical': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Handball/racquetball': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Jump rope': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Martial arts/kickboxing': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Mountain climbing': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Rowing machine': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Running': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Sailing (competitive)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Team sports (competitive) (soccer, etc.)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Body weight exercises (pushups, etc.)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Team sports (soccer, etc.)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Stair climbing': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Swimming/surfing': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },
  'Tennis (singles)': {
    category: 'Activities'
    points: 3,
		timeChunk: {value: 20, unit: 'minutes'}}
  },

  // Bonus points
  'Walking/biking to work': {
    category: 'Bonus',
    points: 3,
    timeChunk: {value: 1, unit: 'day'}}
  },

  // Healthy behavior points
  'Eating a healthy breakfast': {
    category: 'Healthy Behavior',
    points: 1,
		timeChunk: {value: 1, unit: 'day'}}
  },
  'Drinking 6+ (8 oz) glasses of water': {
    category: 'Bonus',
    points: 2,
		timeChunk: {value: 1, unit: 'day'}}
  },
  'Eating 2 Fruits': {
    category: 'Bonus',
    points: 2,
		timeChunk: {value: 1, unit: 'day'}}
  },
  'Eating 3 vegetables': {
    category: 'Bonus',
    points: 2,
		timeChunk: {value: 1, unit: 'day'}}
  },
  'Joining a gym': {
    category: 'Bonus',
    points: 5,
		timeChunk: {value: 1, unit: 'year'}}
  },
  'Weight loss': {
    description: '5 points per pound of weight lost in a given week, up to 2 pounds per week'
    category: 'Bonus',
    points: 5,
		timeChunk: {value: 1, unit: 'week'}}
  },
};

/**
 * GET /activities
 * Return activities object
 * At some point it may make sense to store this data in a database
 */
exports.getActivities = (req, res) => {
  return activities;
};
