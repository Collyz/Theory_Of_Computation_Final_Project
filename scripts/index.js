// Holds all circles (circle data)
let circles = [];
let start = null;
// Holds all line data()
let lines = [];
let adjList = null;
// Dragging 
let dragging = false;
let offsetX = 0;
let offsetY = 0;
// Line Drawing
let prevCirc = null;
let currCirc = null;
let deleteBool = null;
let currLine = null;
// The alphabet is set to contain 0's and 1's by default. We'll change to null later
let alphabetArray = ['0','1'];

// P5 canvas setup
function setup() {
    let myCanvas = createCanvas(600, 400);
    myCanvas.parent('canvasContainer');
    background(200);
    
}

// Draws every frame
function draw(){
    clear();
    noFill();
    background(181, 166, 130);
    if(deleteBool == true){
        deleteCircles();
        deleteBool = false;
    }
    
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
    if (dragging && currCirc !== null) {
        circles[currCirc].x = mouseX - offsetX;
        circles[currCirc].y = mouseY - offsetY;
    }

}

// On single mouse click
function mousePressed(){
    // Selection loop
    for(let i = 0 ; i < circles.length; i++){
        if(dist(mouseX, mouseY, circles[i].x, circles[i].y) < circles[i].r){
            // If there is a previous blue circle, check, if not, make current selection blue
            if(currCirc === null){
                let tempX = circles[i].x;
                let tempY = circles[i].y;
                circles[i].color = 'red';
                currCirc = i;
            }else{
                // If there is a previous blue circle, replace the old one 
                circles[currCirc].color = 'None';
                // Make the new selected circle blue
                circles[i].color = 'red';
                prevCirc = currCirc;
                currCirc = i;
            }
            if(mouseButton === RIGHT && currCirc !== null){
                // Error catching if the user cancels the prompt
                let label = prompt("Enter state name", "");
                // Error catching if the user cancels the prompt
                if(label === null){
                    label = ""
                } 
                circles[currCirc].text = label;
                if(label === "q_0"){
                    start = currCirc;
                    circles[start].color = 'blue';
                }
            }
            break;
        }
    }
    // Dragging check
    if (currCirc !== null && mouseButton === LEFT) {
        if (dist(mouseX, mouseY, circles[currCirc].x, circles[currCirc].y) < circles[currCirc].r) {
            offsetX = mouseX - circles[currCirc].x;
            offsetY = mouseY - circles[currCirc].y;
            dragging = true;
        }
    }

    // Line selection loop
    for(let i = 0; i < lines.length; i++){
        // Check if mouse click is close enough to the line
        if(lines[i].isMouseOnLine() && mouseButton === RIGHT){ // Add a small tolerance
            // lines[i].color = "green";
            let weight = prompt("Enter a weight for the line:");
            
            lines[i].color = "green";
            
            if(weight !== null){
                //All code under this if-statement replaces any old transitions with new transitions
                lines[i].transition = [];
                currTransitions = weight.split(",");
                lines[i].text = weight;
                for(var j = 0; j < currTransitions.length; j++){
                    if (alphabetArray.indexOf(currTransitions[j]) === -1) {
                        alert("Transition contains symbols not in the alphabet"); // If a character is not found in the charArray, return false
                        lines[i].text = "";
                        lines[i].transition = [];
                        break;
                    }
                    lines[i].addTransition(currTransitions[j]);
                }
                print(lines[i].transition);

                //Add new transitions to adj list
                generateAdjList();
            }else{
                lines[i].text = "";
            }
            if(currLine === null){
                currLine = i;
                lines[currLine].color = "green";
            }else{
                lines[currLine].color = 'None';
                currLine = i;
                lines[i].color = "green";
            }
            break;
        }
       
    }
}

// On mouse released
function mouseReleased(){
    dragging = false;
}

function deleteCircles(){
    // Add line removal logic (TODO)
    let toDelete = [];
    for(let i = 0; i < lines.length; i++){
        if(lines[i].c1 === currCirc || lines[i].c2 === currCirc ){
            toDelete.push(i);
        }
    }
    
    toDelete.sort(function(a, b){return a - b});
    for(let i = toDelete.length-1; i >=0 ; i--){
        lines.splice(toDelete[i], 1);
    }

    // Adjust line indices after removing lines
    for(let i = 0; i < lines.length; i++){
        if(lines[i].c1 > currCirc) lines[i].c1--; // Decrement index if it's greater than the deleted circle index
        if(lines[i].c2 > currCirc) lines[i].c2--; // Decrement index if it's greater than the deleted circle index
    }

    circles.splice(currCirc, 1);
    currCirc = null;


    //A new Adj List is created every time a state is deleted to accomodate new changes
    generateAdjList();
}

// Delete blue circles
window.addEventListener('keydown', function(e){
    if(e.key === 'Delete'){
        if(currCirc !== null){
            deleteBool = true;
        }
    }
});

// Draws Lines
window.addEventListener("click", function(e){
    if(e.shiftKey){
        if(currCirc !== null){
            if(currCirc !== null && prevCirc !== null){
                lines.push(new Arrow(prevCirc, currCirc));
                //A new Adj List is created every time that a new line is added
                generateAdjList();
            }
        }
    }
});

//This is to acquire the alphabet from the user's input
document.getElementById('Alphabet').onclick = function(){
    var alphabet = prompt("Enter alphabet (Please separate each value with a comma and no spaces): ");
    if(alphabet == null || alphabet.trim() == ""){
        alert("No alphabet entered.");
    }
    else{
        var div = document.getElementById("currAlphabet");
        div.innerHTML = alphabet;
        alphabetArray = alphabet.split(',');
        console.log(alphabetArray);
    }
}

//This is to acquire the input string from the user's input
document.getElementById('String').onclick = function () {
    var string = prompt("Enter string: ");
    if (string == null || string == "") {
        alert("No String Entered.");
    }
    else {
        //This block of code checks to see if the string contains characters only in the alphabet
        let valid = true;
        for(var i = 0; i < string.length; i++){
            if (alphabetArray.indexOf(string[i]) === -1) {
                alert("String contains symbols not in the alphabet"); // If a character is not found in the charArray, return false
                valid = false;
                console.log(valid);
                break;
            }
        }
        //If a valid input has been entered and if a start state has been defined, then read the input
        if(valid === true && start !== null){
            readString(string);
        }
        if(start === null){
            alert("No start state has been defined.");
        }
    }
}

//This function is used to read the input string
//(the console.log statements are to just help track adj list changes
//Please keep them for now).
function readString(string){
    let currState = start;
    let nextTrans = false;
    // console.log(typeof(currState));
    console.log("Start: " + currState);
    for(var i = 0; i < string.length; i++){
        console.log("Curr symbol " + string[i]);
        currList = adjList.getList(currState);
        console.log("Curr list" + currList);
        if(currList === undefined || currList === null){
            alert("This string is rejected");
            return;
        }
        // console.log(currList);
        for(var j = 0; j < currList.length; j++){
            transitionsList = currList[j][1];
            console.log(transitionsList);
            if(transitionsList.indexOf(string[i]) !== -1){
                console.log("Curr state " + currState);
                nextTrans = true;
                currState = currList[j][0];
                break;
            }
            else{   
                nextTrans = false;
            }
        }
        //Rejects the string if there is no other transition to go to
        if(nextTrans === false){
            alert("This string is rejected");
            return;
        }
    }
    console.log("Final state " + currState);
    console.log("Final state circle " + circles[currState]);
    console.log("Final state circle " + circles[currState].acceptState);
    //Checks if the string is in the accept state at the very end
    if(circles[currState] !== null && circles[currState].acceptState === true){
        alert("This string is accepted");
    }
    else{
        alert("This string is rejected");
    }
}

// Behavior: Triggers only once per click, i.e. cannot drag to create

// On Double Click, draw a circle (if on blue circle, make accept state or revert to normal state)
ondblclick = (event) => {
    let d = 0;
    if (mouseButton === LEFT && currCirc !== null) {
        // If double click with left mouse button and a blue circle is selected
        d = dist(mouseX, mouseY, circles[currCirc].x, circles[currCirc].y);
        if (d < circles[currCirc].r) {
            // If on top of blue circle make accept state / revert it
            if (circles[currCirc].acceptState) {
                circles[currCirc].acceptState = false;
            } else {
                circles[currCirc].acceptState = true;
            }
        } else {
            // If not on blue circle, add a new circle to the canvas
            circles.push(new Circ(null, null, 'None'));
        }
        // If no blue circle already exists, make a new circle
    } else {
        circles.push(new Circ(null, null, 'None'));
    }
};


function generateAdjList(){
    adjList = new AdjList();
    for(let line of lines){
        
        adjList.addToAdjList(line.c1, line.c2, line.getTransition());
    }
    //This is used to just keep track of the adj list changes by printing to console
    
    adjList.print();
}


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
        this.text = "";
        this.color = null;
        this.transition = [];
        this.x1 = null;
        this.x2 = null;
        this.y1 = null;
        this.y2 = null;
    }

    isMouseOnLine() {
        // Calculate distances from mouse to line endpoints
        let d = dist(mouseX, mouseY, this.x1, this.y1);
        let d2 = dist(mouseX, mouseY, this.x2, this.y2);
        let lineLength = dist(this.x1, this.y1, this.x2, this.y2);

        // Check if mouse click is close enough to the line
        if (d + d2 <= lineLength + 5) { // Add a small tolerance
            return true;
        }
        return false;
    }


    addTransition(symbol){
        //Checks to see if the transition is already written on the line
        if(this.transition.indexOf(symbol) === -1){
            this.transition.push(symbol);
        }
        else{
            alert("This symbol is already a part of this transition");
        }
    }

    getTransition(){
        if(this.transition !== null){
            return this.transition;
        }
        else{
            console.log("No transitions have been defined for this line");
        }
    }

    display(){
        if(this.c1 === this.c2){
            let centerX = circles[this.c1].x;
            let centerY = circles[this.c1].y;
            let radius = circles[this.c1].r;

            // Calculate the starting angle and ending angle for the arc
            let startAngle = PI;
            let endAngle = 0;

            //
            stroke(0);
            noFill();
            arc(centerX, centerY-radius+4, radius, radius * 2, startAngle, endAngle - 0.872665);
            // Find points for the triangle that points down into the circle
            let triangleBaseWidth = 10; // Adjust the width of the triangle base as needed
            let triangleHeight = 10; // Adjust the height of the triangle as needed
            // Use the circle as a guide, move accordingly below
            let triangleX1 = centerX - triangleBaseWidth / 2 + 10;
            let triangleY1 = centerY - radius - triangleHeight + 1;

            let triangleX2 = centerX + triangleBaseWidth / 2 + 10;
            let triangleY2 = centerY - radius - triangleHeight+1;

            let triangleX3 = centerX + 10; 
            let triangleY3 = centerY - radius + 1;

            // Draw the triangle
            
            triangle(triangleX1, triangleY1, triangleX2, triangleY2, triangleX3, triangleY3);
            text(this.text, triangleX1 - 10, triangleY1 - 20);
        }else{
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

            // Color 
            if(this.color === 'None' || this.color === null){
                stroke(0);
            }else{
                stroke(this.color);
            }
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
            this.x1 = x1;
            this.x2 = x3;
            this.y1 = y1;
            this.y2 = y3;
            let textCenterX = lerp(x1, x3, .5);
            let textCenterY = lerp(y1, y3, .5) - 5;
            text(this.text, textCenterX, textCenterY);
        }
    }

}


class AdjList{
    constructor(){
        //A map will contain the specific node
        //which is paired with it's adjacency list
        this.adjList = {};
    }
    
    //Adds a node to a specific list within the Adj List
    addToAdjList(node, newNode, transition){
        //Create a new list for that specific node if it doesn't exist in the Adj List
        if(this.adjList[node] == null){
            // console.log(typeof(node));
            this.adjList[node] = [];
        }
        if(this.adjList[node].indexOf(newNode) === -1){
            // console.log(typeof(this.adjList[node]));
            let pair = [];
            pair.push(newNode);
            pair.push(transition);
            this.adjList[node].push(pair);
        }
    }

    //Returns adj list for a specific node
    //Trying to access the adj list normally was giving me and undefined list, so I had to create this getter method
    getList(node){
        if(this.adjList[node] !== null){
            return this.adjList[node];
        }
        else{
            console.log("This node does not have any edges");
        }
    }
    
    //Print function for each list if u wanna test stuff
    print(){
        for(let node in this.adjList){
            console.log(node + ": "+ this.adjList[node]);
        }
    }
    
    
}