import path from 'path';
import {createCanvas, loadImage} from 'canvas';
import fs from 'fs';
export async function makeBanner(eventName, eventTime){
    const canvas = createCanvas(600,200);
    const ctx = canvas.getContext("2d");

    const base = await loadImage(path.resolve(".", "./assets/banner.png"));
    ctx.drawImage(base, 0,0);

    ctx.font = '65px Arial bold';
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.fillText(eventName, base.width/2, (base.height/2)+15);
    
    ctx.font = '20px Arial bold';
    ctx.textAlign = "left";
    ctx.fillText(eventTime, base.width-150, base.height-22)
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(path.resolve(".", "./assets/banner-today.png"), buffer);
}