export const gameKinds = ['quiz', 'sort', 'match', 'sequence']
export const gameLabels = { quiz:'Mystery choices', sort:'Sorting safari', match:'Connection quest', sequence:'Story builder' }
export const gameEmoji = { quiz:'🔎', sort:'🧺', match:'🧩', sequence:'🛤️' }
export function nextKind(history = []) {
  const used = history.slice(-3).map(item => item.kind)
  return gameKinds.find(kind => !used.includes(kind)) || gameKinds[(gameKinds.indexOf(history.at(-1)?.kind)+1)%gameKinds.length]
}
export function isCorrect(round, answer) {
  return answer.length === round.solution.length && answer.every((value,i) => value === round.solution[i])
}
const round = (prompt,cards,targets,solution,explanation,hint) => ({prompt,cards,targets,solution,explanation,hint})
export function sampleLesson(kind) {
  const examples = {
    quiz: {
      title:'Ocean detectives', concept:'Sea animals have different ways of breathing and moving.',
      intro:'Fish breathe underwater with gills. Whales and dolphins are mammals: they breathe air with lungs and come up to the surface.',
      rounds:[round('A dolphin comes to the surface. What does it need?', ['Air','A tree','A nest'],[],[0],'Dolphins breathe air with lungs, so they need to come to the surface.','Think about how a dolphin breathes.'),round('Which animal uses gills to breathe underwater?',['Whale','Clownfish','Dolphin'],[],[1],'A clownfish is a fish. Fish use gills to get oxygen from water.','Look for the fish.')],
    },
    sort: {
      title:'Who belongs together?', concept:'We can group sea animals by how they breathe.',
      intro:'Whales and dolphins are mammals that breathe air. Clownfish and salmon are fish that use gills. Put each animal in its group!',
      rounds:[round('Sort these ocean neighbors.', ['🐬 Dolphin','🐠 Clownfish','🐳 Whale','🐟 Salmon'],['Air-breathing mammal','Fish with gills'],[0,1,0,1],'Whales and dolphins breathe air with lungs. Clownfish and salmon use gills.','Two of these animals need to come up for air.'),round('Try another mix!',['Salmon','Whale','Clownfish','Dolphin'],['Fish with gills','Air-breathing mammal'],[0,1,0,1],'Different shapes do not always mean different groups. How an animal breathes helps us sort it.','Remember which animals are mammals.')],
    },
    match: {
      title:'Ocean connection quest', concept:'Different sea animals have different body features.',
      intro:'An octopus has eight arms. A fish uses gills underwater. A whale has lungs to breathe air. A turtle has a shell. Connect each animal to its feature!',
      rounds:[round('Match each animal to its special feature.', ['Octopus','Whale','Turtle','Fish'],['A shell','Gills','Eight arms','Lungs'],[2,3,0,1],'Body features help us describe and compare ocean animals.','Read the learning note if you need a clue.'),round('Match the feature back to an animal.', ['Eight arms','A shell','Lungs'],['Turtle','Octopus','Whale'],[1,0,2],'We can make the same connection in either direction.','An octopus has arms; a turtle has a shell.')],
    },
    sequence: {
      title:'A turtle’s growing-up story', concept:'A life cycle has stages that happen in an order.',
      intro:'A sea turtle begins as an egg. A baby hatches, then grows into an adult. An adult female can lay eggs, starting the cycle again.',
      rounds:[round('Build a turtle’s growing-up story.', ['Adult turtle','Egg','Baby hatches','Young turtle grows'],[],[1,2,3,0],'An egg comes before a hatchling. The baby grows into an adult turtle.','Start with the egg.'),round('What happens around hatching? Put these in order.', ['Baby comes out','Egg is laid','Eggshell opens'],[],[1,2,0],'The egg is laid first. Later the shell opens as the baby hatches.','What has to exist before a shell can open?')],
    },
  }
  return { ...examples[kind],kind,topic:'Ocean animals',aid:'',sources:[],origin:'sample',id:crypto.randomUUID() }
}
