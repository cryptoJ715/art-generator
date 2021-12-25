//IMPORTS
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { readFile, writeFile, readdir } = require("fs").promises;
const mergeImages = require('merge-images');
const { Image, Canvas } = require('canvas');
const ImageDataURI = require('image-data-uri');
const { config } = require('process');

let progress = 1;
let curLayerIndex = -1;
let cNum = [];
let p = [];
let allImages = [];
let totalSupply = 12000;
let flag = new Array(totalSupply+1);
let crashFlag = {};
let allLayer = [
    // [0, 1, 2, 3],
    // [0, 1, 2, 3, 4],
    // [0, 1, 2, 3, 4, 5],
    // [0, 1, 2, 3, 4, 5, 6],
    [0, 1, 2, 3, 4, 5, 6, 7],
    // [0, 1, 2, 3, 4, 5, 6, 8],
    // [0, 1, 2, 3, 4, 5, 6, 7, 9],
    // [0, 1, 2, 3, 4, 5, 6, 8, 9]
];

let blacklist = [
    [1, 1, -1, -1, -1, -1, -1, -1],
    // [3, 0, -1, 3, -1, 5, -1, 2],
    // [1, 7, -1, 3, -1, -1, -1, 1],
];

const inputDirPath = process.cwd()+"\\BABYE";
// const inputDirPath = process.cwd()+"\\_images";
const outputDirPath = process.cwd()+"\\result";

function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

function getLengthPerLayer() {
    for(let i=0; i<pickCnt; i++)
        cNum.push(allImages[i].length);
}

function generateObject() {
    // console.log(allImages);
    for(let i=0; i<allLayer.length; i++){
        cNum = [];
        let j;
        for(j=0; j<allLayer[i].length; j++)
            cNum.push(allImages[allLayer[i][j]].length);
        p = new Array(cNum.length);
        if(j > 0) {
            curLayerIndex = i;
            dupPermutation();
        }
        console.log("numbers:", cNum);
    }
}

function isBlackList(list){
    let i, j;
    let bBlack = false;
    for(i=0; i<blacklist.length; i++){        
        for(j=0; j<blacklist[i].length; j++){
            if(blacklist[i][j] < 0) continue;
            if(blacklist[i][j] != list[j]) break;
        }
        if(j == blacklist[i].length) {
            bBlack = true; break;
        }
    }
    return bBlack;
}

async function dupPermutation() {
    for(let i=0; i<totalSupply; i++){
        for(let j=0; j<p.length; j++) p[j] = 0;
        for(let j=0; j<p.length; j++){
            p[j] = Math.floor(Math.random()*cNum[j]);
        }
        // console.log(p);
        let key = JSON.stringify(p);
        if(crashFlag[key] == undefined){
            let black = isBlackList(p);
            if(!black) {
                // console.log("key:", key);
                await generateImages(p);
            }
            crashFlag[key] = true;
        }
    }
}

// async function dupPermutation(k) {
//     for(let i=0; i<cNum[k]; i++){
//         p[k] = i;
//         if( k<cNum.length-1 ) await dupPermutation(k+1);
//         else if(k==cNum.length-1) {
//             let temp = [];
//             for(let j=0; j<cNum.length; j++) temp.push(p[j]);
//             await generateImages(temp);
//             // console.log(temp);
//         }
//     }
// }

const readImages = async() => {
    for(let i=0; i<flag.length; i++)
        flag[i] = false;

    const subDirPath = fs.readdirSync(inputDirPath);
    pickCnt = subDirPath.length;
    for(let i=0; i<subDirPath.length; i++){
        let filePath = path.join(inputDirPath, subDirPath[i])
        let files = fs.readdirSync(filePath).sort();
        allImages.push(files);
    }
}

const generateFileName = () => {    
    let counter=0;
    for(let i=1; i<=totalSupply; i++)
        if (!flag[i]) counter++;
    if(counter <= totalSupply/50){
        let i;
        for(i=0; i<totalSupply; i++)
            if(!flag[i]) break;
        flag[i] = true;
        return i;
    } else {
        let num = 0;
        for(;flag[num];)
            num = between(0, totalSupply);
        flag[num] = true;
        return num;
    }
}

const generateImages = async(gen) => {
    const subDirPath = fs.readdirSync(inputDirPath);
    let img=[];
    for(let j=0; j< gen.length; j++){
        let layerNum = allLayer[curLayerIndex][j];
        let imgNum = gen[j];
        // console.log(layerNum, imgNum ,allImages[layerNum][imgNum]);
        let imgPath = inputDirPath +"\\"+ subDirPath[layerNum] +"\\"+ allImages[layerNum][imgNum];
        img.push(imgPath);
    }
    // let id = generateFileName();
    let data = await mergeImages(img, {format : 'image/png', Canvas: Canvas, Image: Image});
    await ImageDataURI.outputFile(data, outputDirPath + `\\${progress}.png`);
    console.log(progress, "/", totalSupply);
    progress++;
}

async function main() {
    await readImages();
    
    generateObject();

    // console.log(allLayer);
    // console.log(cNum);
    // dupPermutation(0);
    // await generateImages();
    // console.timeEnd("test");
}

main();
