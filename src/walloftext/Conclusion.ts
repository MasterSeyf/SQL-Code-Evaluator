import { TaskDefinition } from '../tasks/taskCommons';

// Abschlusstext nach Beenden des Experimentes
const Conclusion: TaskDefinition = {
  text:
    'BITTE SCHLIEẞEN SIE DIESES FENSTER NOCH NICHT!' +
    '\nIhre Eingaben wurden verarbeitet und Ihre Evaluierung ist nun beendet.' +
    '\nIm letzten Schritt muss jetzt die generierte .​csv-Datei mit den erhobenen Daten heruntergeladen werden.' +
    '\nKlicken Sie für diesen Download bitte auf den unteren Button oder betätigen Sie die Entertaste.' +
    '\nSenden Sie mir diese Datei im Anschluss zu.' +
    '\nNachdem Sie die Datei heruntergeladen haben können Sie dieses Fenster schließen.' +
    '\n' +
    '\n****Vielen Dank für ihre Partizipation!****'
};

export default Conclusion;
