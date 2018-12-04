import * as fs from "fs";

let inputPath = "data"; //folder with json data

let data: any = {};

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
    let dataDictonary: string = "";

    let attTable: string = "";

    for(let i in data)
    {
        dataDictonary += i + "::= ";
        for(let j in data[i])
        {
            if(j == "Id")
            {
                dataDictonary += "#Id + ";
            }
            else if(data[i][j] in data)
                dataDictonary += `{ @${j} } + `;
            else
                dataDictonary += `${j} + `;
        }
        dataDictonary = dataDictonary.substr(0, dataDictonary.length - 2);
        dataDictonary += '\n';
        dataDictonary += '\n';

        //generate components

        for(let j in data[i])
        {
            //the * is for markdowns lists
            dataDictonary += `* ${j}::= ${ JSON.stringify(data[i][j]).replace( new RegExp('"', 'g'), '')};\n`;
        }
        dataDictonary += '\n';

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

        let max = 82 //max chars in one line

        let longestAtt: number = 8;
        let longestTyp: number = 3;

        for(let c in data[i])
        {
            longestAtt = (c.length > longestAtt)? c.length : longestAtt;
            longestTyp = (data[i][c].length > longestTyp)? data[i][c].length : longestTyp;
        }

        let lineSpaceings: Array<number> = [];

        lineSpaceings[0] = longestAtt + 2;
        lineSpaceings[1] = longestTyp + 2;
        lineSpaceings[2] = max - longestAtt - longestTyp - 4 - 4; //4 for the +s'es and 4 spacings in the other two boxes

        let stdLine: string = "";
        let headLine: string = "";

        stdLine += `+${ "-".repeat(lineSpaceings[0]) }+${ "-".repeat(lineSpaceings[1]) }+${ "-".repeat(lineSpaceings[2]) }+\n`

        headLine = stdLine.replace( new RegExp('-', 'g') ,"="); //replace without regex only replaces the first encounter

        attTable += `:(${i} )\\:\n`;
        attTable += stdLine;

        attTable += `| Attribut ${ " ".repeat(lineSpaceings[0] - 10) }| Typ ${ " ".repeat(lineSpaceings[1] - 5) }| Beschreibung ${ " ".repeat(lineSpaceings[2] - 14) }|\n`;

        attTable += headLine;

        for(let j in data[i])
        {

            let desc = `${ j } der ${ i }`;

            attTable += `| ${ j }${ " ".repeat(lineSpaceings[0] - j.length - 1) }| ${ capFirstLetter( JSON.stringify(data[i][j]).replace( new RegExp('"', 'g'), '') ) }${ " ".repeat(lineSpaceings[1] - data[i][j].length - 1) }| ${ desc }${ " ".repeat(lineSpaceings[2] - 1 - desc.length)}|\n`;
            attTable += stdLine;
        }
        attTable += '\n';
    }
    fs.writeFileSync('dataDic.dat', dataDictonary, 'utf8');
    fs.writeFileSync('attTable.dat', attTable, 'utf8');
})

//capatilze the first letter, so we dont have to do it in the json files
function capFirstLetter(str: string): string
{
    return str[0].toUpperCase() + str.slice(1);
}