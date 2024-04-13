// Holds all circles (circle data)
let circles = [];
// Holds all line data()
let lines = [];
// Previously selected 
let selected = null;
// Previous (curr blue) blue circle
let lastBlue = null;
// Dragging 
let dragging = false;
// Line Drawing
let prevCirc = null;
let currCirc = null;

// P5 canvas setup
function setup() {
    let myCanvas = createCanvas(600, 400);
    myCanvas.parent('canvasContainer');
    background(200);
}

// Draws every frame
function draw(){
    clear();
    background(200);

    // Drawing Circles
    for(let i = 0; i < circles.length; i++){
        circles[i].display();
    }

    // Draw Lines
    for(let i = 0; i < lines.length; i++){
        lines[i].display();
    }


    // Updating position of selected blue circle when dragging
    if(dragging && lastBlue !== null){
        circles.splice(lastBlue, 1, new Circ(mouseX, mouseY, 'blue'));
        
    }
}

// On single mouse click
function mousePressed(){
    // Selection loop
    for(let i = 0 ; i < circles.length; i++){
        if(dist(mouseX, mouseY, circles[i].x, circles[i].y) < circles[i].r){
            // If there is a previous blue circle, check, if not, make current selection blue
            if(lastBlue === null){
                let tempX = circles[i].x;
                let tempY = circles[i].y;
                circles.splice(i, 1, new Circ(tempX, tempY, 'blue'));
                lastBlue = i;
                currCirc = i;
            }else{
                // If there is a previous blue circle, replace the old one 
                let tempX = circles[lastBlue].x;
                let tempY = circles[lastBlue].y;
                circles.splice(lastBlue, 1, new Circ(tempX, tempY, 'None'));
                // Make the new selected circle blue
                let tempX2 = circles[i].x;
                let tempY2 = circles[i].y;
                circles.splice(i, 1, new Circ(tempX2, tempY2, 'blue'));
                prevCirc = lastBlue;
                lastBlue = i;
                currCirc = i;
            }
            
            break;
        }
    }
    // Dragging check
    if(lastBlue !== null && mouseButton === LEFT){
        if(dist(mouseX, mouseY, circles[lastBlue].x, circles[lastBlue].y) < circles[lastBlue].r){
            dragging = true;
        }
    }
}

// On mouse released
function mouseReleased(){
    dragging = false;
}

// Delete blue circles
window.addEventListener('keydown', function(e){
    if(e.key === 'Delete'){
        if(lastBlue !== null){
            circles.splice(lastBlue, 1);
            lastBlue = null;
        }
    }

});

// Draw Lines????
window.addEventListener("click", function(e){
    if(e.shiftKey){
        if(lastBlue !== null){
            if(currCirc !== null && prevCirc !== null){

                lines.push(new Arrow(prevCirc, currCirc));
            }
        }
    }
});

// Behavior: Triggers only once per click, i.e. cannot drag to create

// On Double Click, draw a circle

ondblclick = (event) =>{
    if(mouseButton === LEFT){
        circles.push(new Circ(null, null,'None'));
    }
};



class Circ {
    constructor(x, y, color){
        if(x === null && y === null){
            this.x = mouseX;
            this.y = mouseY;
        } else{
            this.x = x;
            this.y = y;
        }
        this.d = 50;
        this.r = this.d/2;
        this.color = color;
    }

    display(){
        if(this.color !== 'None'){
            stroke(this.color)
        }else{
            stroke(0);
        }
        circle(this.x, this.y, this.r * 2);
    }

    x(){
        return this.x;
    }
}

class Arrow {
    constructor(c1, c2){
        this.c1 = c1;
        this.c2 = c2;
    }

    display(){
        let d = dist(circles[this.c1].x, circles[this.c1].y, circles[this.c2].x, circles[this.c2].y);
        let r1 = circles[this.c1].r;
        let r2 = circles[this.c2].r;
        let t1 = r1/d;
        let t2 = r2/d;

        let x1 = (1-t1)*circles[this.c1].x + (t1*circles[this.c2].x);
        let y1 = (1-t1)*circles[this.c1].y + (t1*circles[this.c2].y);
        let x2 = (1-t2)*circles[this.c2].x + (t2*circles[this.c1].x);
        let y2 = (1-t2)*circles[this.c2].y + (t2*circles[this.c1].y);

        let t3 = 10/dist(x1, y1, x2, y2);
        let x3 = (1-t3)*x2 + (t3*x1);
        let y3 = (1-t3)*y2 + (t3*y1);

        let slope = 0;
        if((x3-x2) == 0){
            slope = undefined;
        } else if(y3-y2 == 0){
            slope = 0;
        }else{
            slope = (y3-y2)/(x3-x2);
        }

        function getY(x, x1, y1, slope){
            return (slope*(x-x1))+y1;
        }
        x4 = 
        y4 = 
        x5 = 
        y5 = 


        // Triangles (Fill in)
        // line(x1, y1, x2, y2);
        line(x3, y3, x2, y2);
    }

}