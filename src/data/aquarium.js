export const seaAnimals = [
  { type: 'octopus', name: 'Octopus', emoji: '🐙', color: 'pink', size: 51, speed: 1.5, hint: 'Give your octopus a name and watch it explore your underwater world.' },
  { type: 'squid', name: 'Squid', emoji: '🦑', color: 'rose', size: 54, speed: 2.4, hint: 'Tap the water to guide your squid on a new adventure.' },
  { type: 'fish', name: 'Tropical fish', emoji: '🐠', color: 'gold', size: 44, speed: 2.2, hint: 'Add a few colorful fish to make your pretend reef feel busy.' },
  { type: 'bluefish', name: 'Blue fish', emoji: '🐟', color: 'blue', size: 42, speed: 2, hint: 'Send your little blue swimmer across the tank with a splash.' },
  { type: 'turtle', name: 'Sea turtle', emoji: '🐢', color: 'green', size: 52, speed: 1, hint: 'Take a slow swim around the tank with your turtle friend.' },
  { type: 'dolphin', name: 'Dolphin', emoji: '🐬', color: 'blue', size: 59, speed: 2.8, hint: 'Make room for a playful dolphin in your make-believe ocean.' },
  { type: 'whale', name: 'Whale', emoji: '🐳', color: 'blue', size: 68, speed: 1.1, hint: 'A big ocean friend for your imaginary aquarium!' },
  { type: 'crab', name: 'Crab', emoji: '🦀', color: 'rose', size: 42, speed: 1.2, bottom: true, hint: 'Look near the sandy floor for your little crab explorer.' },
]
export const aquariumLimit = 20
export function createAnimal(type) {
  const species = seaAnimals.find(animal => animal.type === type) || seaAnimals[0]
  return { id: crypto.randomUUID(), type: species.type, name: species.name, x: 15 + Math.random() * 70, y: species.bottom ? 84 : 22 + Math.random() * 48, vx: (Math.random() > .5 ? 1 : -1) * species.speed, vy: (Math.random() - .5) * .7 }
}
export function swimAnimal(animal, food) {
  const species = seaAnimals.find(item => item.type === animal.type)
  let { x, y, vx, vy } = animal
  const minY = species.bottom ? 77 : 15
  const maxY = species.bottom ? 87 : 75
  if (food) {
    const dx = food.x - x
    const dy = Math.max(minY, Math.min(maxY, food.y)) - y
    const distance = Math.hypot(dx, dy)
    if (distance > 2) { vx = dx / distance * species.speed; vy = dy / distance * species.speed }
    else { vx *= .85; vy *= .85 }
  }
  if (!food && Math.hypot(vx, vy) < .3) { vx = species.speed; vy = species.bottom ? .1 : .25 }
  x += vx * .13
  y += vy * .13
  if (x <= 8 || x >= 92) vx = -vx
  if (y <= minY || y >= maxY) vy = -vy
  return { ...animal, x: Math.max(8, Math.min(92, x)), y: Math.max(minY, Math.min(maxY, y)), vx, vy }
}
