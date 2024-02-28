import kaboom from "kaboom"

/* Hier werden Funktionen aus den eigenen Datein eingebunden.
 * Die Dateien liegen jeweils im `src` Verzeichnis. Funktionen die in anderen
 * Dateien definiert werden, und hier verwendet werden, müssen das
 * Schlüsselwort `export` haben. Werden mehrere Funktionen exportiert, braucht
 * es die `{}`-Klammern. Wird nur eine einzige Funktion exportiert, kann man
 * diese mit dem Schlüsselwort `default` kennzeichnen, und dann kann die
 * Funktion auch ohne `{}`-Klammer importiert werden.
 */
import loadSprites from "./sprites.js"

/* Wir können auch einzelne Variablen importieren.
 * Das können wir verwenden um globale Konstanten zu definieren, die wir
 * dann in verschiedenen Datein brauchen können. Das eignet sich vor allem
 * für Dinge wie TILESIZE oder FPS. Diese möchten wir an einem Ort
 * haben, und schnell um ganzen Code ändern können.
 */
import { TILESIZE } from "./globals.js"

import { getPlayer } from "./player.js"

/*
 * Hier wird die GameEngine initialisiert. Wir können hier verschiedene Dinge
 * anpassen. Wichtig ist das wir kaboom sagen wo unser Spiel gezeichnet werden
 * soll, dafür geben wir das HTML-Canvas-Element an.
 * Ganz wichtig ist die Höhe und Breite von unserem Spiel, das müssen Sie so
 * anpassen, dass es für Sie stimmt. Am besten verwenden Sie hier ein
 * vielfaches von TILESIZE.
 */
export const k = kaboom({
  font: "sinko",
  background: [0, 0, 0],
  debug: true,
  height: TILESIZE * 16,
  width: TILESIZE * 30,
  canvas: document.getElementById("game-canvas"),
})

/*
 * Diese Funktion ladet die Graphiken und Animationen die wir später im Spiel
 * verwenden möchten. Wir müssen diese Funktion noch vor allen anderen
 * aufrufen, damit die Graphiken auch verfügbar sind.
 */
loadSprites()

export function addGeneralGameLogic() {
  const player = getPlayer()

  createHPBar()

  k.onCollide("heal", "player", (heal, player) => {
    player.heal(heal.healAmount)
    if (heal.isConsumable === true) {
      heal.destroy()
    }
  })

  k.onCollide("obstacle", "player", (obstacle, player) => {
    player.hurt(obstacle.dmgAmount)
    if (obstacle.isConsumable === true) {
      obstacle.destroy()
    }
  })

  player.on("heal", () => {
    const oldSpeed = player.speed
    player.speed *= 2
    k.wait(1, () => {
      player.speed = oldSpeed
    })
  })

  player.on("death", async () => {
    await import("./scenes/lose.js")
    k.go("lose")
  })
}

function createHPBar() {
  const player = getPlayer()
  if (player == null) return

  const x = 50
  const y = 20
  const HP_BAR_WIDTH = 100
  const HP_BAR_HEIGHT = 10

  const bar = k.add([k.pos(x, y), k.fixed(), k.z(10), "hp-bar"])

  bar.add([k.text("HP", { size: 20 }), k.anchor("right")])

  bar.add([
    k.rect(HP_BAR_WIDTH, HP_BAR_HEIGHT),
    k.outline(4, k.GREEN.darken(100)),
    k.color(0, 0, 0),
    k.anchor("left"),
    k.pos(10, 0),
  ])

  bar.add([
    k.rect((player.hp() / player.max_hp) * HP_BAR_WIDTH, HP_BAR_HEIGHT),
    k.color(0, 255, 0),
    k.anchor("left"),
    k.pos(10, 0),
    {
      update() {
        const player = getPlayer()
        this.width = (player.hp() / player.max_hp) * HP_BAR_WIDTH
      },
    },
  ])
}
