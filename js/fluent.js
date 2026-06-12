/* Emoji → asset names for Microsoft Fluent Emoji 3D
   (https://github.com/microsoft/fluentui-emoji, MIT license).
   Entries with p:1 are people/skin-tone assets stored in a Default folder.
   Emoji missing from this map simply fall back to Twemoji. */

const FLUENT = {
  // fruits
  '🍎': 'Red apple', '🍌': 'Banana', '🍇': 'Grapes', '🍉': 'Watermelon',
  '🍋': 'Lemon', '🍊': 'Tangerine', '🍓': 'Strawberry', '🍒': 'Cherries',
  '🍑': 'Peach', '🍐': 'Pear', '🍍': 'Pineapple', '🥝': 'Kiwi fruit',
  '🥭': 'Mango', '🥥': 'Coconut', '🫐': 'Blueberries',
  // vegetables
  '🥕': 'Carrot', '🌽': 'Ear of corn', '🍅': 'Tomato', '🍆': 'Eggplant',
  '🥔': 'Potato', '🥦': 'Broccoli', '🥒': 'Cucumber', '🫑': 'Bell pepper',
  '🧅': 'Onion', '🧄': 'Garlic', '🍄': 'Mushroom', '🎃': 'Jack-o-lantern',
  '🥑': 'Avocado', '🫒': 'Olive',
  // animals
  '🐶': 'Dog face', '🐱': 'Cat face', '🦁': 'Lion', '🐯': 'Tiger face',
  '🐘': 'Elephant', '🐵': 'Monkey face', '🐰': 'Rabbit face', '🐻': 'Bear',
  '🦊': 'Fox', '🐼': 'Panda', '🐷': 'Pig face', '🐮': 'Cow face',
  '🐴': 'Horse face', '🐑': 'Ewe', '🐔': 'Chicken', '🐧': 'Penguin',
  '🐸': 'Frog', '🐳': 'Spouting whale', '🐬': 'Dolphin', '🐍': 'Snake',
  '🐢': 'Turtle', '🦉': 'Owl', '🦓': 'Zebra', '🦒': 'Giraffe',
  '🦆': 'Duck', '🐟': 'Fish', '🐙': 'Octopus', '🦋': 'Butterfly',
  '🐝': 'Honeybee', '🐨': 'Koala',
  // food
  '🍞': 'Bread', '🧀': 'Cheese wedge', '🥚': 'Egg', '🍕': 'Pizza',
  '🍰': 'Shortcake', '🍪': 'Cookie', '🥛': 'Glass of milk', '🍯': 'Honey pot',
  '🍚': 'Cooked rice', '🍲': 'Pot of food', '🥗': 'Green salad', '🥪': 'Sandwich',
  '🍿': 'Popcorn', '🍫': 'Chocolate bar', '🍩': 'Doughnut', '🍔': 'Hamburger',
  '🍟': 'French fries', '🌭': 'Hot dog', '🌮': 'Taco', '🥞': 'Pancakes',
  '🥐': 'Croissant', '🥨': 'Pretzel', '🥓': 'Bacon',
  // kitchen
  '🔪': 'Kitchen knife', '🥄': 'Spoon', '🍽️': 'Fork and knife with plate',
  '🥣': 'Bowl with spoon', '☕': 'Hot beverage', '🫖': 'Teapot',
  '🍳': 'Cooking', '🧂': 'Salt', '🫙': 'Jar', '🥢': 'Chopsticks',
  // home
  '🛏️': 'Bed', '🪑': 'Chair', '🛋️': 'Couch and lamp', '🚪': 'Door',
  '🪟': 'Window', '💡': 'Light bulb', '🔑': 'Key', '🚽': 'Toilet',
  '🛁': 'Bathtub', '🧼': 'Soap', '🧹': 'Broom', '🧺': 'Basket',
  '🕯️': 'Candle', '🪞': 'Mirror', '⏰': 'Alarm clock', '📺': 'Television',
  '☎️': 'Telephone',
  // clothes
  '👕': 'T-shirt', '👗': 'Dress', '👟': 'Running shoe', '🧢': 'Billed cap',
  '👒': 'Womans hat', '🧦': 'Socks', '🧣': 'Scarf', '🧤': 'Gloves',
  '🧥': 'Coat', '👖': 'Jeans', '👢': 'Womans boot', '👑': 'Crown',
  '👓': 'Glasses', '💍': 'Ring', '🩳': 'Shorts', '👡': 'Womans sandal',
  // transport
  '🚗': 'Automobile', '🚌': 'Bus', '🚆': 'Train', '✈️': 'Airplane',
  '🚢': 'Ship', '🚲': 'Bicycle', '🚀': 'Rocket', '🚁': 'Helicopter',
  '🚕': 'Taxi', '🚚': 'Delivery truck', '🚜': 'Tractor', '⛵': 'Sailboat',
  '🛴': 'Kick scooter', '🏍️': 'Motorcycle', '🚑': 'Ambulance', '🛶': 'Canoe',
  // school
  '📖': 'Open book', '✏️': 'Pencil', '🖊️': 'Pen', '✂️': 'Scissors',
  '📏': 'Straight ruler', '🎒': 'Backpack', '🌍': 'Globe showing europe-africa',
  '💻': 'Laptop', '🔔': 'Bell', '📓': 'Notebook', '🖍️': 'Crayon',
  '📎': 'Paperclip', '🧲': 'Magnet', '🔬': 'Microscope', '📅': 'Calendar',
  // body
  '👁️': 'Eye', '👄': 'Mouth', '🦷': 'Tooth', '🧠': 'Brain', '🦴': 'Bone',
  '👅': 'Tongue', '🫀': 'Anatomical heart',
  '👂': { n: 'Ear', p: 1 }, '👃': { n: 'Nose', p: 1 },
  '✋': { n: 'Raised hand', p: 1 }, '🦶': { n: 'Foot', p: 1 },
  '🦵': { n: 'Leg', p: 1 }, '💪': { n: 'Flexed biceps', p: 1 },
  // nature
  '☀️': 'Sun', '🌙': 'Crescent moon', '⭐': 'Star', '☁️': 'Cloud',
  '🌧️': 'Cloud with rain', '❄️': 'Snowflake', '🌈': 'Rainbow',
  '🌳': 'Deciduous tree', '🌸': 'Cherry blossom', '🍁': 'Maple leaf',
  '⛰️': 'Mountain', '🌋': 'Volcano', '🌊': 'Water wave', '🔥': 'Fire',
  '⚡': 'High voltage', '🌵': 'Cactus', '🌹': 'Rose',
  '⛄': 'Snowman without snow',
  // toys
  '⚽': 'Soccer ball', '🏀': 'Basketball', '🪁': 'Kite', '🥁': 'Drum',
  '🎸': 'Guitar', '🎹': 'Musical keyboard', '🤖': 'Robot', '🎲': 'Game die',
  '🧩': 'Puzzle piece', '🎈': 'Balloon', '🎁': 'Wrapped gift', '🏆': 'Trophy',
  '🏅': 'Sports medal', '🎻': 'Violin', '🎺': 'Trumpet', '🛹': 'Skateboard',
  '🎳': 'Bowling', '🧸': 'Teddy bear',
  // colors
  '🔴': 'Red circle', '🔵': 'Blue circle', '🟢': 'Green circle',
  '🟡': 'Yellow circle', '🟠': 'Orange circle', '🟣': 'Purple circle',
  '🟤': 'Brown circle', '⚫': 'Black circle', '⚪': 'White circle',
  '💗': 'Growing heart',
  // numbers
  '0️⃣': 'Keycap 0', '1️⃣': 'Keycap 1', '2️⃣': 'Keycap 2', '3️⃣': 'Keycap 3',
  '4️⃣': 'Keycap 4', '5️⃣': 'Keycap 5', '6️⃣': 'Keycap 6', '7️⃣': 'Keycap 7',
  '8️⃣': 'Keycap 8', '9️⃣': 'Keycap 9', '🔟': 'Keycap 10',
  // jobs
  '🧑‍⚕️': { n: 'Health worker', p: 1 }, '🧑‍🏫': { n: 'Teacher', p: 1 },
  '🧑‍🍳': { n: 'Cook', p: 1 }, '🧑‍🌾': { n: 'Farmer', p: 1 },
  '🧑‍🚒': { n: 'Firefighter', p: 1 }, '🧑‍✈️': { n: 'Pilot', p: 1 },
  '🧑‍🚀': { n: 'Astronaut', p: 1 }, '🧑‍🔬': { n: 'Scientist', p: 1 },
  '🧑‍🎨': { n: 'Artist', p: 1 }, '🧑‍🎤': { n: 'Singer', p: 1 },
  '👷': { n: 'Construction worker', p: 1 }, '👮': { n: 'Police officer', p: 1 },
  '🕵️': { n: 'Detective', p: 1 }, '🧑‍⚖️': { n: 'Judge', p: 1 },
  '🧑‍🔧': { n: 'Mechanic', p: 1 },
  // insects
  '🐜': 'Ant', '🕷️': 'Spider', '🐞': 'Lady beetle', '🐌': 'Snail',
  '🪱': 'Worm', '🦟': 'Mosquito', '🦗': 'Cricket', '🪲': 'Beetle',
  '🪰': 'Fly', '🐛': 'Bug', '🦂': 'Scorpion',
  // school clock shares ⏰ with home
};

if (typeof module !== 'undefined') module.exports = { FLUENT };
