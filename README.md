# generator

in generator

npm install --save-dev @types/node

somit kann man alle nodejs module und typescript nutzen

import * as fs from "fs";

# Usage

Im Ordner "Out/data" für jede seiner "Klassen" eine JSON anlegen.

{
    "Id":"number",
    "Name":"String",
    "Standort":"String",
    "Methoden": {
        "add(datum)":"Neue Anlage anlegen"
    }
}

Der "Methoden" Tag ist hier speziell und wird bei dem Data Dictonary rausgeschmissen.
Daraus werden nachher die Methoden Tabellen gebildet.

Im Out Ordener node index.js aufrufen und kurz Warten.

Es sollten nun 4 Datein generiert wurden sein.

* dataDic.dat
* attTable.dat
* metTable.dat
* classDiagram.uxf

die classDiagram.uxf mit Umlet öffnen und richtig anordnen.