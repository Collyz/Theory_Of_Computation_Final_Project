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
let offsetX = 0;
let offsetY = 0;
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

    // REUSING i and lengths
    let i = 0, lenCir = circles.length, lenLine = lines.length;

    // Drawing Circles
    while(i < lenCir){
        circles[i].display();
        i++;
    }

    // Draw Lines
    i = 0;
    while(i < lenLine){
        lines[i].display();
        i++;
    }


    // Updating position of selected blue circle when dragging
    if(dragging && lastBlue !== null){
        circles[lastBlue].x = mouseX - offsetX;
        circles[lastBlue].y = mouseY - offsetY;
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
                circles[i].color = 'red';
                lastBlue = i;
                currCirc = i;
            }else{
                // If there is a previous blue circle, replace the old one 
                circles[lastBlue].color = 'None';
                // Make the new selected circle blue
                circles[i].color = 'red';
                prevCirc = lastBlue;
                lastBlue = i;
                currCirc = i;
            }
            if(mouseButton === RIGHT && lastBlue !== null){
                // Error catching if the user cancels the prompt
                let label = prompt("Enter state name", "");
                // Error catching if the user cancels the prompt
                if(label === null){
                    label = ""
                }
                circles[lastBlue].text = label;
            }
            break;
        }
    }
    // Dragging check
    if(lastBlue !== null && mouseButton === LEFT){
        if(dist(mouseX, mouseY, circles[lastBlue].x, circles[lastBlue].y) < circles[lastBlue].r){
            offsetX = mouseX - circles[lastBlue].x;
            offsetY = mouseY - circles[lastBlue].y;
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
            // Add line removal logic (TODO)
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

// On Double Click, draw a circle (if on blue circle, make accept state or revert to normal state)
ondblclick = (event) =>{
    let d = 0;

    if(mouseButton === LEFT && lastBlue !== null){
        // If double click with left mouse button and a blue circle is selected
        d = dist(mouseX, mouseY, circles[lastBlue].x, circles[lastBlue].y);
        if(d < circles[lastBlue].r){
            // If on top of blue circle make accept state / revert it
            if(circles[lastBlue].acceptState){
                circles[lastBlue].acceptState = false;
            }else{
                circles[lastBlue].acceptState = true;
            }
        }else{
            // If not on blue circle, add a new circle to the canvas
            circles.push(new Circ(null, null, 'None'));
        }
        // If no blue circle already exists, make a new circle
    }else{
        circles.push(new Circ(null, null, 'None'));
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
        this.acceptState = false;
        this.text = "";
    }

    display(){
        if(!this.acceptState){
            if(this.color !== 'None'){
                stroke(this.color)
            }else{
                stroke(0);
            }
            circle(this.x, this.y, this.r * 2);
        }else{
            if(this.color !== 'None'){
                stroke(this.color)
            }else{
                stroke(0);
            }
            circle(this.x, this.y, this.d);
            circle(this.x, this.y, this.d-10);
        }
        text(this.text, this.x - (this.text.length*3), this.y+3);
        
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

        // Calculate distances and ratios for offsetting the long line between circles so that they do not overlap with the circle
        let d = dist(circles[this.c1].x, circles[this.c1].y, circles[this.c2].x, circles[this.c2].y);
        let r1 = circles[this.c1].r;
        let r2 = circles[this.c2].r;
        let t1 = r1/d;
        let t2 = r2/d;

        // Calculating start and end points of the original line mentioned above (using those ratios^)
        let x1 = (1-t1)*circles[this.c1].x + (t1*circles[this.c2].x);
        let y1 = (1-t1)*circles[this.c1].y + (t1*circles[this.c2].y);
        let x2 = (1-t2)*circles[this.c2].x + (t2*circles[this.c1].x);
        let y2 = (1-t2)*circles[this.c2].y + (t2*circles[this.c1].y);

        // Calculate point 5 pixels away from end point
        let t3 = 10/dist(x1, y1, x2, y2);
        let x3 = (1-t3)*x2 + (t3*x1);
        let y3 = (1-t3)*y2 + (t3*y1);

        // Calculate the slope of the original line (big line)
        let slope = (y2 - y1) / (x2 - x1);

        // Calculate slope of the original line
        let perpSlope, dx, dy;
        
        if (slope === Infinity || slope === -Infinity) {
            // Handle vertical line case
            perpSlope = 0;
            dx = 5;
            dy = 0;
        } else if (slope === 0) {
            // Handle horizontal line case
            perpSlope = Infinity;
            dx = 0;
            dy = 5;
        } else {
            // Calculate perpendicular slope
            perpSlope = -1 / slope;

            // Calculate 5 pixel offsets
            dx = 5 / Math.sqrt(1 + Math.pow(perpSlope, 2));
            dy = perpSlope * dx;
        }

        // Calculate points for perpendicular line
        let perpStartX = x3 - dx;
        let perpStartY = y3 - dy;
        let perpEndX = x3 + dx;
        let perpEndY = y3 + dy;


        // READ ME
        // First circle point (touches circle) - (x1, x2)
        // Second circle point (touches circle) - (x2, y2)
        // Point 5 pixels away from second circle (5 pixels away from second circle) - (x3, y3)
        // Points perpendicular to line between first and second circle that is perpendicular at the point (x3, y3) - (perpStartX, perpStartY) and (perpEndX, perpEndY)

        // Draw the triangle
        // Use perpStartX and perpStartY to define 'left' vertex of triangle
        // Middle of triangle is the point that touches the second circle (x2, y2)
        // End point of triangle is perpEndX, perpEndY
        triangle(perpStartX, perpStartY, x2, y2, perpEndX, perpEndY);

        // Line from first circle to point that is 5 pixels away from second circle (x3, y3) (This is so the line does not go through the arrow)
        line(x1, y1, x3, y3);
    }

}