let circles = [];

const s1 = ( sketch ) => {
    let x = 100;
    let y = 100;
    sketch.setup = () => {
        sketch.createCanvas(600, 600);
      };
    
    sketch.draw = () => {
        sketch.clear();
        sketch.background(200);
        for(let i = 0; i < circles.length; i++){
            circles[i].display();
        }
    };
    sketch.mousePressed = () => {
        if(sketch.mouseButton === sketch.LEFT && true){
            circles.push(new Circ(sketch.mouseX, sketch.mouseY));
        }
        if(sketch.mouseButton === sketch.CENTER){
            for(let i = circles.length - 1; i >= 0; i--){
                if(sketch.dist(sketch.mouseX, sketch.mouseY, circles[i].x, circles[i].y) < circles[i].r){
                    circles.splice(i, 1);
                    break;
                }
            }
        }
    };

    class Circ {
        constructor(x ,y) {
            this.x = x;
            this.y = y;
            this.d = 30;
            this.r = this.d / 2;
    
        }
        display(){
            sketch.circle(this.x, this.y, this.r * 2);
        }
    
        x(){
            return this.x;
        }
    }
    
};

// function mousePressed(){
//     console.log("click")
//     if(mouseButton === LEFT && true){
//         circles.push(new Circ());
//     }
//     if(mouseButton === CENTER){
//         for(let i = circles.length - 1; i >= 0; i--){
//             if(dist(mouseX, mouseY, circles[i].x, circles[i].y) < circles[i].r){
//                 circles.splice(i, 1);
//                 break;
//             }
//         }
//     }
// }

let myp5 = new p5(s1, document.getElementById('canvasContainer'));


// function setup() {
//     let myCanvas = createCanvas(600, 400);
//     myCanvas.parent('canvasContainer');
//     // drawingContext.shadowOffsetX = 5;
//     // drawingContext.shadowOffsetY = -5;
//     // drawingContext.shadowBlur = 6;
//     // drawingContext.shadowColor = "black";
//     background(200);
// }


// function draw(){
//     clear();
//     background(200);
//     for(let i = 0; i < circles.length; i++){
//         circles[i].display();
//     }
// }


// Behavior: Triggers only once per click, i.e. cannot drag to create


class Circ {
    constructor(x ,y) {
        this.x = x;
        this.y = y;
        this.d = 30;
        this.r = this.d / 2;

    }
    display(){
        sketch.circle(this.x, this.y, this.r * 2);
    }

    x(){
        return this.x;
    }
}

class Line {
    constructor(){
        this.x1 = mouseX;
        this.y1 = mouseY;
        this.x2 = mouseX;
        this.x2 = mouseY;
    }
}