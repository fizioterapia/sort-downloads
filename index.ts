const { existsSync, mkdirSync, readdirSync, lstatSync, rename } = require('fs');
const { green, yellow, red, grey } = require('colors/safe');

const config = require('./config.json');

interface Directory {
    name: string,
    extensions: string[]
}

const downloadsPath: string = config.downloadsPath; // could replace with process.env.HOME or cd to directory and use process.env.PWD
const directories: Directory[] = config.directories;

let files: string[] = [];

const log = (msg: string, type?: string) => {
    let msgFormatted: string = "";

    switch(type) {
        case 'success':
            msgFormatted = green(msg);
            break;
        case 'warn':
            msgFormatted = yellow(msg);
            break;
        case 'error':
            msgFormatted = red(msg);
            break;
        default:
            msgFormatted = grey(msg);
            break;
    }

    msgFormatted = `${grey('[LOG - SORTDOWNLOADS]')} ${msgFormatted}`

    console.log(msgFormatted)
}

try {
    files = readdirSync(downloadsPath)
} catch(err) {
    log(`Error! ${err}`, 'error')
}

for(const f in files) {
    const file: string = files[f];

    if(lstatSync(`${downloadsPath}${file}`).isDirectory()) continue;

    const splittedFile: string[] = file.split('.');
    let directory: Directory = directories[0];

    for(const d in directories) {
        const dir: Directory = directories[d];

        if (dir.extensions.includes(splittedFile[splittedFile.length - 1])) {
            directory = dir;

            break;
        }
    }

    if (directory.name === '') {
        log(`Couldn't find extension for ${file}`, 'warn')
        continue;
    }

    if (!existsSync(`${downloadsPath}${directory.name}`)) {
        log(`${directory.name} doesn't exist! Creating right now.`, 'warn')
        mkdirSync(`${downloadsPath}${directory.name}`);
    }

    rename(`${downloadsPath}${file}`, `${downloadsPath}${directory.name}/${file}`, function (err: string) {
        if (err) {
            log(`Error! ${err}`, 'error')
        } else {
            log(`Moved ${file} into ${directory.name}!`, 'success')
        }
    });
}

