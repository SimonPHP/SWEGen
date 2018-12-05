import * as fs from "fs";

let inputPath = "data"; //folder with json data

let data: any = {};

let methods: any = {};

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
    let metTable: string = "";

    let classDiagram: string = "";

    classDiagram += `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
            <diagram program="umlet" version="14.3.0">
            <zoom_level>10</zoom_level>` //start tag

    let iter = 0;

    for(let i in data)
    {
        iter++;
        if("Methoden" in data[i]) //extract the Methoden json
        {
            methods[i] = data[i]["Methoden"];
            delete data[i]["Methoden"];
        }

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

        let max = 86 //max chars in one line
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

        {
            /**
             * :(klasse )\: Zusammenstellung Methoden
             * +----------+------------+------------------------------------------------------------+
             * | Methode  |  Signatur  |     Beschreibung                                           |
             * +==========+============+============================================================+
             * | (name)   | (signatur) | beschreibender Text                                        |
             * +----------+------------+------------------------------------------------------------+
             */

            let longestMethod: number = 7;
            let longestSignature: number = 8;

            for(let c in methods[i])
            {
                let methodName = c.split("(")[0];
                let methodSig = c.split("(")[1].slice(0, -1);

                longestMethod = (methodName.length > longestMethod)? methodName.length : longestMethod;
                longestSignature = (methodSig.length > longestSignature)? methodSig.length : longestSignature;
            }

            let lineSpaceings: Array<number> = [];

            lineSpaceings[0] = longestMethod + 2;
            lineSpaceings[1] = longestSignature + 2;
            lineSpaceings[2] = max - longestMethod - longestSignature - 4 - 4; //4 for the +s'es and 4 spacings in the other two boxes

            let stdLine: string = "";
            let headLine: string = "";

            stdLine += `+${ "-".repeat(lineSpaceings[0]) }+${ "-".repeat(lineSpaceings[1]) }+${ "-".repeat(lineSpaceings[2]) }+\n`

            headLine = stdLine.replace( new RegExp('-', 'g') ,"="); //replace without regex only replaces the first encounter

            metTable += `:(${i} )\\:\n`;
            metTable += stdLine;

            metTable += `| Methode ${ " ".repeat(lineSpaceings[0] - 9) }| Signatur ${ " ".repeat(lineSpaceings[1] - 10) }| Beschreibung ${ " ".repeat(lineSpaceings[2] - 14) }|\n`;

            metTable += headLine;

            for(let j in methods[i])
            {

                let methodName = j.split("(")[0];
                let methodSig = j.split("(")[1].slice(0, -1);

                metTable += `| ${ methodName }${ " ".repeat(lineSpaceings[0] - methodName.length - 1) }| ${ methodSig }${ " ".repeat(lineSpaceings[1] - methodSig.length - 1) }| ${ methods[i][j] } ${ " ".repeat(lineSpaceings[2] - 2 - methods[i][j].length)}|\n`;
                metTable += stdLine;
            }
            metTable += '\n';
        }

        //umlet class diagram generation
        {
            /**
                 <?xml version="1.0" encoding="UTF-8" standalone="no"?>
                <diagram program="umlet" version="14.3.0">
                <zoom_level>10</zoom_level>

                <element>
                    <id>UMLClass</id>
                    <coordinates>
                    <x>10</x>
                    <y>70</y>
                    <w>210</w>
                    <h>70</h>
                    </coordinates>
                    <panel_attributes>_object: Class_
                --
                id: Long="36548"
                [waiting for message]</panel_attributes>
                    <additional_attributes/>
                </element>

                </diagram>
             */

             let classAttributes: string = "";
             let classMethods: string = "";

            let aC: number = 0;
            let mC: number = 0;

             for(let a in data[i])
             {
                 classAttributes += `- ${a}: ${data[i][a]} \n`;
                 aC++;
             }
             for(let m in methods[i])
             {
                 classMethods += `+ ${m}: ${methods[i][m]} \n`;
                 mC++;
             }

             classDiagram += `
<element>
    <id>UMLClass</id>
    <coordinates>
    <x>${ iter * 30 }</x>
    <y>${ iter * 30 }</y>
    <w>210</w>
    <h>${ (aC + mC + 2)*20 }</h>
    </coordinates>
    <panel_attributes>${i}
--
${classAttributes}
--
${classMethods}</panel_attributes>
    <additional_attributes/>
</element>
             `;
        }
    }
    fs.writeFileSync('dataDic.dat', dataDictonary, 'utf8');
    fs.writeFileSync('attTable.dat', attTable, 'utf8');
    fs.writeFileSync('metTable.dat', metTable, 'utf8');

    classDiagram += `</diagram>` //end tag

    fs.writeFileSync('classDiagram.uxf', classDiagram, 'utf8');
})

//capatilze the first letter, so we dont have to do it in the json files
function capFirstLetter(str: string): string
{
    return str[0].toUpperCase() + str.slice(1);
}