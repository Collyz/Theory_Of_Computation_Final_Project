new p5();
let boop = random(100);

function setup() {
    let myCanvas = createCanvas(600, 400);
    myCanvas.parent('canvasContainer');
    drawingContext.shadowOffsetX = 5;
    drawingContext.shadowOffsetY = -5;
    drawingContext.shadowBlur = 6;
    drawingContext.shadowColor = "black";
    background(255, 0, boop);
    ellipse(width/2, height/2, 50, 50);
}
  