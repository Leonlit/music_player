const fs = require("fs");

const dir = "songs/";
const file = "./songs_name.txt";

function generateData (filesArr) {
    const objects = [];
    filesArr.forEach(item => {
        const tempItem = {
            source: item,
            title: item.replace(/\.(?:wav|mp3|pcm|aiff|aac|ogg|wma|flac|alac)$/i, ""),
            bgImg: "assets/images/defaultBG.png",
            colour: {
                "firstStop": "#00fbff",
                "secondStop": "#1aa7a9"
            }
        }
        objects.push(tempItem);
    });
    return objects;
}

//get all the filenames from the songs directoy
fs.readdir(dir, (err, files)=> {
    if (err) throw err;
    else {
        const generatedData = generateData(files);
        saveFilesName(JSON.stringify(generatedData));
    }
})

//saving all the names (separated by a comma) into the songs_name.txt file
function saveFilesName(files) {
    fs.writeFile(file, files, (err)=>{
        if (err) throw err;
        else {
            console.log(`Saved songs name into the ${file} folder.`);
        }
    });
}