/* Themed word lists. Every word has an emoji used as the picture clue.
   Images are rendered from OpenMoji (https://openmoji.org, CC BY-SA 4.0)
   with the native emoji as a fallback. */

const THEMES = [
  {
    id: 'fruits', name: 'Fruits', icon: '🍎', color: '#f4511e',
    words: [
      { w: 'apple', e: '🍎' }, { w: 'banana', e: '🍌' }, { w: 'grapes', e: '🍇' },
      { w: 'watermelon', e: '🍉' }, { w: 'lemon', e: '🍋' }, { w: 'orange', e: '🍊' },
      { w: 'strawberry', e: '🍓' }, { w: 'cherry', e: '🍒' }, { w: 'peach', e: '🍑' },
      { w: 'pear', e: '🍐' }, { w: 'pineapple', e: '🍍' }, { w: 'melon', e: '🍈' },
      { w: 'kiwi', e: '🥝' }, { w: 'mango', e: '🥭' }, { w: 'coconut', e: '🥥' },
      { w: 'blueberry', e: '🫐' },
    ],
  },
  {
    id: 'vegetables', name: 'Vegetables', icon: '🥕', color: '#43a047',
    words: [
      { w: 'carrot', e: '🥕' }, { w: 'corn', e: '🌽' }, { w: 'tomato', e: '🍅' },
      { w: 'eggplant', e: '🍆' }, { w: 'potato', e: '🥔' }, { w: 'broccoli', e: '🥦' },
      { w: 'cucumber', e: '🥒' }, { w: 'pepper', e: '🫑' }, { w: 'onion', e: '🧅' },
      { w: 'garlic', e: '🧄' }, { w: 'mushroom', e: '🍄' }, { w: 'lettuce', e: '🥬' },
      { w: 'pumpkin', e: '🎃' }, { w: 'avocado', e: '🥑' }, { w: 'olive', e: '🫒' },
    ],
  },
  {
    id: 'animals', name: 'Animals', icon: '🦁', color: '#fb8c00',
    words: [
      { w: 'dog', e: '🐶' }, { w: 'cat', e: '🐱' }, { w: 'lion', e: '🦁' },
      { w: 'tiger', e: '🐯' }, { w: 'elephant', e: '🐘' }, { w: 'monkey', e: '🐵' },
      { w: 'rabbit', e: '🐰' }, { w: 'bear', e: '🐻' }, { w: 'fox', e: '🦊' },
      { w: 'panda', e: '🐼' }, { w: 'pig', e: '🐷' }, { w: 'cow', e: '🐮' },
      { w: 'horse', e: '🐴' }, { w: 'sheep', e: '🐑' }, { w: 'chicken', e: '🐔' },
      { w: 'penguin', e: '🐧' }, { w: 'frog', e: '🐸' }, { w: 'whale', e: '🐳' },
      { w: 'dolphin', e: '🐬' }, { w: 'snake', e: '🐍' }, { w: 'turtle', e: '🐢' },
      { w: 'owl', e: '🦉' }, { w: 'zebra', e: '🦓' }, { w: 'giraffe', e: '🦒' },
      { w: 'duck', e: '🦆' }, { w: 'fish', e: '🐟' }, { w: 'octopus', e: '🐙' },
      { w: 'butterfly', e: '🦋' }, { w: 'bee', e: '🐝' }, { w: 'koala', e: '🐨' },
    ],
  },
  {
    id: 'food', name: 'Food', icon: '🍕', color: '#e53935',
    words: [
      { w: 'bread', e: '🍞' }, { w: 'cheese', e: '🧀' }, { w: 'egg', e: '🥚' },
      { w: 'pizza', e: '🍕' }, { w: 'cake', e: '🍰' }, { w: 'cookie', e: '🍪' },
      { w: 'milk', e: '🥛' }, { w: 'honey', e: '🍯' }, { w: 'rice', e: '🍚' },
      { w: 'soup', e: '🍲' }, { w: 'salad', e: '🥗' }, { w: 'sandwich', e: '🥪' },
      { w: 'popcorn', e: '🍿' }, { w: 'chocolate', e: '🍫' }, { w: 'donut', e: '🍩' },
      { w: 'hamburger', e: '🍔' }, { w: 'fries', e: '🍟' }, { w: 'hotdog', e: '🌭' },
      { w: 'taco', e: '🌮' }, { w: 'pancakes', e: '🥞' }, { w: 'croissant', e: '🥐' },
      { w: 'pretzel', e: '🥨' }, { w: 'bacon', e: '🥓' },
    ],
  },
  {
    id: 'kitchen', name: 'Kitchen', icon: '🍳', color: '#00897b',
    words: [
      { w: 'knife', e: '🔪' }, { w: 'spoon', e: '🥄' }, { w: 'fork', e: '🍴' },
      { w: 'plate', e: '🍽️' }, { w: 'bowl', e: '🥣' }, { w: 'cup', e: '☕' },
      { w: 'glass', e: '🥛' }, { w: 'teapot', e: '🫖' }, { w: 'pan', e: '🍳' },
      { w: 'pot', e: '🍲' }, { w: 'salt', e: '🧂' }, { w: 'chopsticks', e: '🥢' },
    ],
  },
  {
    id: 'home', name: 'Home', icon: '🛋️', color: '#8e24aa',
    words: [
      { w: 'bed', e: '🛏️' }, { w: 'chair', e: '🪑' }, { w: 'couch', e: '🛋️' },
      { w: 'door', e: '🚪' }, { w: 'window', e: '🪟' }, { w: 'lamp', e: '💡' },
      { w: 'key', e: '🔑' }, { w: 'toilet', e: '🚽' }, { w: 'bathtub', e: '🛁' },
      { w: 'soap', e: '🧼' }, { w: 'broom', e: '🧹' }, { w: 'basket', e: '🧺' },
      { w: 'candle', e: '🕯️' }, { w: 'mirror', e: '🪞' }, { w: 'clock', e: '⏰' },
      { w: 'television', e: '📺' }, { w: 'telephone', e: '☎️' },
    ],
  },
  {
    id: 'clothes', name: 'Clothes', icon: '👕', color: '#1e88e5',
    words: [
      { w: 'shirt', e: '👕' }, { w: 'dress', e: '👗' }, { w: 'shoe', e: '👟' },
      { w: 'cap', e: '🧢' }, { w: 'hat', e: '👒' }, { w: 'sock', e: '🧦' },
      { w: 'scarf', e: '🧣' }, { w: 'gloves', e: '🧤' }, { w: 'coat', e: '🧥' },
      { w: 'jeans', e: '👖' }, { w: 'boot', e: '👢' }, { w: 'crown', e: '👑' },
      { w: 'glasses', e: '👓' }, { w: 'ring', e: '💍' }, { w: 'shorts', e: '🩳' },
      { w: 'sandal', e: '👡' },
    ],
  },
  {
    id: 'transport', name: 'Transport', icon: '🚗', color: '#3949ab',
    words: [
      { w: 'car', e: '🚗' }, { w: 'bus', e: '🚌' }, { w: 'train', e: '🚆' },
      { w: 'plane', e: '✈️' }, { w: 'ship', e: '🚢' }, { w: 'bicycle', e: '🚲' },
      { w: 'rocket', e: '🚀' }, { w: 'helicopter', e: '🚁' }, { w: 'taxi', e: '🚕' },
      { w: 'truck', e: '🚚' }, { w: 'tractor', e: '🚜' }, { w: 'boat', e: '⛵' },
      { w: 'scooter', e: '🛴' }, { w: 'motorcycle', e: '🏍️' }, { w: 'ambulance', e: '🚑' },
      { w: 'canoe', e: '🛶' },
    ],
  },
  {
    id: 'school', name: 'School', icon: '🎒', color: '#d81b60',
    words: [
      { w: 'book', e: '📖' }, { w: 'pencil', e: '✏️' }, { w: 'pen', e: '🖊️' },
      { w: 'scissors', e: '✂️' }, { w: 'ruler', e: '📏' }, { w: 'backpack', e: '🎒' },
      { w: 'globe', e: '🌍' }, { w: 'computer', e: '💻' }, { w: 'clock', e: '⏰' },
      { w: 'bell', e: '🔔' }, { w: 'notebook', e: '📓' }, { w: 'crayon', e: '🖍️' },
      { w: 'paperclip', e: '📎' }, { w: 'magnet', e: '🧲' }, { w: 'microscope', e: '🔬' },
      { w: 'calendar', e: '📅' },
    ],
  },
  {
    id: 'body', name: 'My Body', icon: '👀', color: '#6d4c41',
    words: [
      { w: 'eye', e: '👁️' }, { w: 'ear', e: '👂' }, { w: 'nose', e: '👃' },
      { w: 'mouth', e: '👄' }, { w: 'hand', e: '✋' }, { w: 'foot', e: '🦶' },
      { w: 'leg', e: '🦵' }, { w: 'tooth', e: '🦷' }, { w: 'brain', e: '🧠' },
      { w: 'bone', e: '🦴' }, { w: 'tongue', e: '👅' }, { w: 'arm', e: '💪' },
      { w: 'heart', e: '🫀' },
    ],
  },
  {
    id: 'nature', name: 'Nature', icon: '🌈', color: '#039be5',
    words: [
      { w: 'sun', e: '☀️' }, { w: 'moon', e: '🌙' }, { w: 'star', e: '⭐' },
      { w: 'cloud', e: '☁️' }, { w: 'rain', e: '🌧️' }, { w: 'snow', e: '❄️' },
      { w: 'rainbow', e: '🌈' }, { w: 'tree', e: '🌳' }, { w: 'flower', e: '🌸' },
      { w: 'leaf', e: '🍁' }, { w: 'mountain', e: '⛰️' }, { w: 'volcano', e: '🌋' },
      { w: 'wave', e: '🌊' }, { w: 'fire', e: '🔥' }, { w: 'lightning', e: '⚡' },
      { w: 'cactus', e: '🌵' }, { w: 'rose', e: '🌹' }, { w: 'snowman', e: '⛄' },
    ],
  },
  {
    id: 'toys', name: 'Toys & Games', icon: '🧸', color: '#7cb342',
    words: [
      { w: 'ball', e: '⚽' }, { w: 'basketball', e: '🏀' }, { w: 'kite', e: '🪁' },
      { w: 'drum', e: '🥁' }, { w: 'guitar', e: '🎸' }, { w: 'piano', e: '🎹' },
      { w: 'robot', e: '🤖' }, { w: 'dice', e: '🎲' }, { w: 'puzzle', e: '🧩' },
      { w: 'balloon', e: '🎈' }, { w: 'gift', e: '🎁' }, { w: 'trophy', e: '🏆' },
      { w: 'medal', e: '🏅' }, { w: 'violin', e: '🎻' }, { w: 'trumpet', e: '🎺' },
      { w: 'skateboard', e: '🛹' }, { w: 'bowling', e: '🎳' }, { w: 'teddybear', e: '🧸' },
    ],
  },
];

if (typeof module !== 'undefined') module.exports = { THEMES };
