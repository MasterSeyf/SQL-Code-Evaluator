# Studying Possible Effects of the Position of Sub-Query-Aliases and Join Conditions on the Readability of SQL Statements via Repeated N-of-1 Studies
This is the testing environment for my master's thesis (2025).
The goal is to find out whether an alternative syntax of SQL might
aid programmers in locating code errors more efficiently.
As part of my empirical study, test subjects will be presented with SQL-Code where errors have been injected which had to be found.
The needed error localization time will be measured and analyzed.

The test can be run in the browser via the link below.
The estimated time for one completion is about 1 hour.
After completion, sending me the generated CSV file is appreciated.
The email address can be found below as well.

Note: Experimentation is completed as of April 2025 and no further Datasets are required. However, you can still experiment on your own terms.

Experiment: [HTML-Preview
link to start the experiement](https://htmlpreview.github.io/?https://raw.githubusercontent.com/MasterSeyf/SQL-Code-Evaluator/master/dist/index.html)

Email: Seyfullah.Davulcu@Stud.uni-due.de

## Syntaxvariants

- Postfix alias (standard) or prefix alias (alternative)
- Postfix join conditions (standard) or infix join conditions (alternative)

## Features

- Four different syntactical variants of SQL-Code
- Eight tutorial tasks, 2 for each combination
- A main experiment comprised of 96 tasks (24 per syntaxvariant)
- A window that shows the automatically generated faulty SQL query
- A pausescreen after each task where time measurements are halted
- Generation and Download of a CSV-File with all measuerd metrics after the completion of all tasks

## Results


- 32 Students of the University of Duisburg-Essen were tested
- The results show with significance (p<.001) that programmers required:
  - 31% more time with the standard postfix syntax in comparison to the proposed infix join condition syntax
  - 30% more time with the standard postfix syntax in comparison to the proposed prefix alias condition syntax
  - The effect sizes were larger than medium in magnitude (n^2=.085 and n^2=.080, respectively)
- The results suggest that small syntactical variations can lead to substancial improvements in the performance of programmers. Addtionally, the proposed alternative of the prefix alias positioning made participants half as likely to falsely locate an error during debugging.

## Publication
- This master's thesis has not yet been published as a paper in a scientific journal