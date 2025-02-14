export default class Semaphore {
  // Stellt sicher, dass die async-Funktion stepForward nicht mehrfach aufgerufen wird.
  // Es kann passieren, dass die stepForward-Funktion währen diese ausgeführt wird, von einem UI-Event
  // erneut aufgerufen wird. Somit verschieben sich die Seeds in der Seeder-Klasse
  taskIsRunning = false;
}
