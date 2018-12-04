"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
let inputPath = "data"; //folder with json data
let data = {};
let methods = {};
fs.readdir(inputPath, (err, files) => {
    files.forEach(file => {
        data[file.split(".")[0]] = JSON.parse(fs.readFileSync(inputPath + "/" + file, 'utf8'));
    });
    //genrate data dictornary thing
    /**
     * Fahrplaneintrag::= #Id + {@ AnlagekomponenteId } + Startzeit + Endzeit;
     *
     * * Id::= number;
     * * AnlagekomponenteId::= number;
     * * Startzeit::= Zeit;
     * * Endzeit::= Zeit;
     *
     */
    let dataDictonary = "";
    let attTable = "";
    let metTable = "";
    for (let i in data) {
        if ("Methoden" in data[i]) //extract the Methoden json
         {
            methods[i] = data[i]["Methoden"];
            delete data[i]["Methoden"];
        }
        dataDictonary += i + "::= ";
        for (let j in data[i]) {
            if (j == "Id") {
                dataDictonary += "#Id + ";
            }
            else if (data[i][j] in data)
                dataDictonary += `{ @${j} } + `;
            else
                dataDictonary += `${j} + `;
        }
        dataDictonary = dataDictonary.substr(0, dataDictonary.length - 2);
        dataDictonary += '\n';
        dataDictonary += '\n';
        //generate components
        for (let j in data[i]) {
            //the * is for markdowns lists
            dataDictonary += `* ${j}::= ${JSON.stringify(data[i][j]).replace(new RegExp('"', 'g'), '')};\n`;
        }
        dataDictonary += '\n';
        let max = 86; //max chars in one line
        {
            /**
            * :(Anlage )\: Zusammenstellung Attribute
            * +----------+-------+------------------------------------------------------------+
            * | Attribut |  Typ  |     Beschreibung                                           |
            * +==========+=======+============================================================+
            * | Id       | Number| Id der Anlage                                              |
            * +----------+-------+------------------------------------------------------------+
            * | Name     | String| Name der Anlage                                            |
            * +----------+-------+------------------------------------------------------------+
            * | Standort | String| Standort der Anlage                                        |
            * +----------+-------+------------------------------------------------------------+
            * */
            //first get the longest Attribute and Typ
            let longestAtt = 8;
            let longestTyp = 3;
            for (let c in data[i]) {
                longestAtt = (c.length > longestAtt) ? c.length : longestAtt;
                longestTyp = (data[i][c].length > longestTyp) ? data[i][c].length : longestTyp;
            }
            let lineSpaceings = [];
            lineSpaceings[0] = longestAtt + 2;
            lineSpaceings[1] = longestTyp + 2;
            lineSpaceings[2] = max - longestAtt - longestTyp - 4 - 4; //4 for the +s'es and 4 spacings in the other two boxes
            let stdLine = "";
            let headLine = "";
            stdLine += `+${"-".repeat(lineSpaceings[0])}+${"-".repeat(lineSpaceings[1])}+${"-".repeat(lineSpaceings[2])}+\n`;
            headLine = stdLine.replace(new RegExp('-', 'g'), "="); //replace without regex only replaces the first encounter
            attTable += `:(${i} )\\:\n`;
            attTable += stdLine;
            attTable += `| Attribut ${" ".repeat(lineSpaceings[0] - 10)}| Typ ${" ".repeat(lineSpaceings[1] - 5)}| Beschreibung ${" ".repeat(lineSpaceings[2] - 14)}|\n`;
            attTable += headLine;
            for (let j in data[i]) {
                let desc = `${j} der ${i}`;
                attTable += `| ${j}${" ".repeat(lineSpaceings[0] - j.length - 1)}| ${capFirstLetter(JSON.stringify(data[i][j]).replace(new RegExp('"', 'g'), ''))}${" ".repeat(lineSpaceings[1] - data[i][j].length - 1)}| ${desc}${" ".repeat(lineSpaceings[2] - 1 - desc.length)}|\n`;
                attTable += stdLine;
            }
            attTable += '\n';
        }
        {
            /**
             * :(klasse )\: Zusammenstellung Methoden
             * +----------+------------+------------------------------------------------------------+
             * | Methode  |  Signatur  |     Beschreibung                                           |
             * +==========+============+============================================================+
             * | (name)   | (signatur) | beschreibender Text                                        |
             * +----------+------------+------------------------------------------------------------+
             */
            let longestMethod = 7;
            let longestSignature = 8;
            for (let c in methods[i]) {
                let methodName = c.split("(")[0];
                let methodSig = c.split("(")[1].slice(0, -1);
                console.log("name: " + methodName);
                console.log("sign: " + methodSig);
                longestMethod = (methodName.length > longestMethod) ? methodName.length : longestMethod;
                longestSignature = (methodSig.length > longestSignature) ? methodSig.length : longestSignature;
            }
            let lineSpaceings = [];
            lineSpaceings[0] = longestMethod + 2;
            lineSpaceings[1] = longestSignature + 2;
            lineSpaceings[2] = max - longestMethod - longestSignature - 4 - 4; //4 for the +s'es and 4 spacings in the other two boxes
            let stdLine = "";
            let headLine = "";
            stdLine += `+${"-".repeat(lineSpaceings[0])}+${"-".repeat(lineSpaceings[1])}+${"-".repeat(lineSpaceings[2])}+\n`;
            headLine = stdLine.replace(new RegExp('-', 'g'), "="); //replace without regex only replaces the first encounter
            metTable += `:(${i} )\\:\n`;
            metTable += stdLine;
            metTable += `| Methode ${" ".repeat(lineSpaceings[0] - 9)}| Signatur ${" ".repeat(lineSpaceings[1] - 10)}| Beschreibung ${" ".repeat(lineSpaceings[2] - 14)}|\n`;
            metTable += headLine;
            for (let j in methods[i]) {
                let methodName = j.split("(")[0];
                let methodSig = j.split("(")[1].slice(0, -1);
                metTable += `| ${methodName}${" ".repeat(lineSpaceings[0] - methodName.length - 1)}| ${methodSig}${" ".repeat(lineSpaceings[1] - methodSig.length - 1)}| ${" ".repeat(lineSpaceings[2] - 1)}|\n`;
                metTable += stdLine;
            }
            metTable += '\n';
        }
    }
    fs.writeFileSync('dataDic.dat', dataDictonary, 'utf8');
    fs.writeFileSync('attTable.dat', attTable, 'utf8');
    fs.writeFileSync('metTable.dat', metTable, 'utf8');
    console.log(methods);
});
//capatilze the first letter, so we dont have to do it in the json files
function capFirstLetter(str) {
    return str[0].toUpperCase() + str.slice(1);
}
//# sourceMappingURL=index.js.map