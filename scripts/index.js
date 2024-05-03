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
// Hold the string
let inputString = "";

// P5 canvas setup
function setup() {
    let myCanvas = createCanvas(600, 400);
    myCanvas.parent('canvasContainer');
    background(181, 166, 130);
    
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

    // Updating position of selected red circle when dragging
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
            // If there is a previous red circle, check, if not, make current selection red
            if(currCirc === null){
                let tempX = circles[i].x;
                let tempY = circles[i].y;
                circles[i].color = 'red';
                currCirc = i;
            }else{
                // If there is a previous red circle, replace the old one 
                circles[currCirc].color = 'None';
                // Make the new selected circle red
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
                    circles[start].color = 'red';
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
            let weight = prompt("Enter a weight for the line:");
            lines[i].color = "green";
            
            if(weight !== null){
                //All code under this if-statement replaces any old transitions with new transitions
                lines[i].transition = [];

                // This block of code removes any duplicates from the inputted transition
                let sortedString = weight.split(",").sort();
                let distinctWeights = [];
                for(let i = 0; i < sortedString.length; i++){
                    if(distinctWeights.indexOf(sortedString[i]) === -1){
                        distinctWeights.push(sortedString[i]);
                    }
                }
                weight = distinctWeights.join(",");



                currTransitions = weight.split(",");
                
                initialPoint = lines[i].c1;
                terminalPoint = lines[i].c2;
                for(var j = 0; j < currTransitions.length; j++){
                    if (alphabetArray.indexOf(currTransitions[j]) === -1) {
                        alert("Transition contains symbols not in the alphabet"); // If a character is not found in the charArray, return false
                        lines[i].text = "";
                        lines[i].transition = [];
                        break;
                    }
                    if(determinismCheckForTransition(initialPoint, terminalPoint, currTransitions[j]) === false){
                        console.log("determinism check");
                        alert("Transition already exists; violates determinism rule"); // If a character is not found in the charArray, return false
                        lines[i].text = "";
                        lines[i].transition = [];
                        break;
                    }

                    lines[i].addTransition(currTransitions[j]);
                    lines[i].text = weight;
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

// This checks if the transition that the user adds violates the determinism rule or not
// This is more of a "correctness" check
function determinismCheckForTransition(initialPoint, terminalPoint, currTransition){
    tmpList = adjList.getList(initialPoint);
    console.log("Init point type: " + typeof(initialPoint));
    console.log("Init point list: " + tmpList);
    for(let i = 0; i < tmpList.length; i++){
        tmpTransitionsList = tmpList[i][1];
        console.log("TmpTransitionsList: " + tmpTransitionsList);
        console.log("Curr Trans: " + currTransition)
        for(let j = 0; j < tmpTransitionsList.length; j++){
            console.log("tmpTransitionsList[j]: " + tmpTransitionsList[j]);
            if(currTransition === tmpTransitionsList[j] && terminalPoint != tmpList[i][0]){
                console.log("initial point: " + initialPoint + ", curr point: " + tmpList[i][0]);
                return false;
            }
        }
    }
    return true;
}

// This checks if the state diagram is in a deterministic form before processing the input
// This is more of a "completeness" check; checks if the whole alphabet is actually used for each state or not
function determinismCheckForInput(){
    console.log("det check");
    for(let c = 0; c < circles.length; c++){
        tmpList = adjList.getList(c);
        console.log(tmpList);
        // If the list for a specific node doesn't exist, then it automatically violates determinism
        if(tmpList === undefined || tmpList === null){
            return false;
        }
        else{
            for(let i = 0; i < alphabetArray.length; i++){
                let complete = false;
                for(let j = 0; j < tmpList.length; j++){
                    tmpTransitionsList = tmpList[j][1];
                    for(let k = 0; k < tmpTransitionsList.length; k++){
                        if(alphabetArray[i] === tmpTransitionsList[k]){
                            complete = true;
                            break;
                        }
                    }
                    
                }
                if(complete === false){
                    return false;
                }
            }
        }
    }
    return true;
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

// Delete red circles
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
                if(adjList !== null){
                    // console.log(prevCirc);
                    console.log(adjList);
                    tmpList = adjList.getList(prevCirc);
                    console.log(tmpList);
                    if(tmpList !== undefined){
                        prevCircList = [];
                        for(let i = 0; i < tmpList.length; i++){
                            prevCircList.push(tmpList[i][0]);
                        }
                    }
                    else{
                        prevCircList = undefined;
                    }
                    console.log("Prevlist" + prevCircList);
                    if(prevCircList !== undefined && prevCircList.indexOf(currCirc) !== -1){
                        console.log(prevCirc);
                        alert("This line already exists");
                    }
                    else{
                        //We will check if the backwards line exists to determine how to draw the lines between two states later on
                        //Ex: If a line from A -> B exists, and we want to make a line for B -> A, then there will need to be some changes made here
                        
                        tmpList2 = adjList.getList(currCirc);
                        //Checks if any lines for the terminal vertex already exist
                        if(tmpList2 !== undefined){
                            currCircList = [];
                            for(let i = 0; i < tmpList2.length; i++){
                                currCircList.push(tmpList2[i][0]);
                            }
                            //Checks among the lines of the terminal vertex and looks to see if a line in the opposite direction exists
                            if(currCircList.indexOf(prevCirc) !== -1){
                                prevCircIndex = currCircList.indexOf(prevCirc);
                                aboveLineIndex = tmpList2[prevCircIndex][2];
                                aboveLine = lines[aboveLineIndex];
                                aboveLine.above = true;
                                belowLine = new Arrow(prevCirc, currCirc);
                                belowLine.below = true;
                                lines.push(belowLine);
                            }
                            else{
                                lines.push(new Arrow(prevCirc, currCirc));
                            }
                        }
                        else{
                            lines.push(new Arrow(prevCirc, currCirc));
                        }
                        //A new Adj List is created every time that a new line is added
                        generateAdjList();
                    }
                }
                //This will execute when an no states exist yet, which also means no adj list has been initialized either
                else{
                    
                    lines.push(new Arrow(prevCirc, currCirc));
                    console.log(lines[lines.length - 1].aboveLine + " and " + lines[lines.length - 1].belowLine);
                    //A new Adj List is created every time that a new line is added
                    generateAdjList();
                }
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
    // Storing the input string;
    inputString = prompt("Enter string: ");
    if (inputString == null || inputString == "") {
        alert("No String Entered.");
        inputString = "";
        document.getElementById("input").innerHTML = "Input: (empty)";
    }
    else {
        if(determinismCheckForInput() === false){
            console.log("Determinism check for input");
            alert("Not all symbols in the alphabet were used for each state; violates determinism rule");
        }
        else{
            // Show the input string on the page
            document.getElementById("input").innerHTML = "input: " + inputString;
            //This block of code checks to see if the string contains characters only in the alphabet
            let valid = true;
            for(var i = 0; i < inputString.length; i++){
                if (alphabetArray.indexOf(inputString[i]) === -1) {
                    alert("String contains symbols not in the alphabet"); // If a character is not found in the charArray, return false
                    valid = false;
                    console.log(valid);
                    break;
                }
            }
            //If a valid input has been entered and if a start state has been defined, then read the input
            if(valid === true && start !== null){
                readString(inputString);
            }
            if(start === null){
                alert("No start state has been defined.");
            }
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
    circles[currState].color = "purple";
}

// Behavior: Triggers only once per click, i.e. cannot drag to create

// On Double Click, draw a circle (if on red circle, make accept state or revert to normal state)
ondblclick = (event) => {
    let d = 0;
    if (mouseButton === LEFT && currCirc !== null && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        // If double click with left mouse button and a red circle is selected
        d = dist(mouseX, mouseY, circles[currCirc].x, circles[currCirc].y);
        if (d < circles[currCirc].r) {
            // If on top of red circle make accept state / revert it
            if (circles[currCirc].acceptState) {
                circles[currCirc].acceptState = false;
            } else {
                circles[currCirc].acceptState = true;
            }
        } else {
            // If not on red circle, add a new circle to the canvas
            if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
                circles.push(new Circ(null, null, 'None'));
            }
        }
        // If no red circle already exists, make a new circle
    } else {
        if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
            circles.push(new Circ(null, null, 'None'));
        }
    }
};


function generateAdjList(){
    adjList = new AdjList();
    for(let i = 0; i < lines.length; i++){
        
        adjList.addToAdjList(lines[i].c1, lines[i].c2, lines[i].getTransition(), i);
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
        this.above = null;
        this.below = null;
    }

    isMouseOnLine() {
        // Calculate distances from mouse to line endpoints
        let d = dist(mouseX, mouseY, this.x1, this.y1);
        let d2 = dist(mouseX, mouseY, this.x2, this.y2);
        let lineLength = dist(this.x1, this.y1, this.x2, this.y2);
        if(this.c1 !== this.c2){
            // Check if mouse click is close enough to the line
            if (d + d2 <= lineLength + 2) { // Add a small tolerance
                return true;
            }
            return false;
        }else{
            let d = dist(mouseX, mouseY, this.x1, this.y1);
            if(d <= 10 + 5){
                return true;
            }else{
                return false;
            }
        }

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

    // //Set the line to be above if there are two lines going both ways
    // setAboveLineStatus(){
    //     this.
    // }

    // //Set the line to be below if there are two lines going both ways
    // setBelowLineStatus(){

    // }

    display(){
        if(this.c1 === this.c2){
            let centerX = circles[this.c1].x;
            let centerY = circles[this.c1].y;
            let radius = circles[this.c1].r;

            // Calculate the starting angle and ending angle for the arc
            let startAngle = PI;
            let endAngle = 0;

            stroke(0);
            noFill();
            this.x1 = centerX;
            this.y1 = centerY-radius-10; 
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
        }
        else{
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

            if(this.above === true){
                perpStartY = perpStartY - 10;
                perpEndY = perpEndY - 10;
                perpStartX = perpStartX - 10;
                perpEndX = perpEndX - 10;
                y1 = y1 - 10;
                y3 = y3 - 10;
                x1 = x1 - 10;
                x3 = x3 - 10;
            }
            else if(this.below === true){
                perpStartY = perpStartY + 10;
                perpEndY = perpEndY + 10;
                perpStartX = perpStartX + 10;
                perpEndX = perpEndX + 10;
                y1 = y1 + 10;
                y3 = y3 + 10;
                x1 = x1 + 10;
                x3 = x3 + 10;
            }

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
    addToAdjList(node, newNode, transition, lineIndex){
        //Create a new list for that specific node if it doesn't exist in the Adj List
        if(this.adjList[node] == null){
            // console.log(typeof(node));
            this.adjList[node] = [];
        }
        if(this.adjList[node].indexOf(newNode) === -1){
            // console.log(typeof(this.adjList[node]));
            let triple = [];
            triple.push(newNode);
            triple.push(transition);
            triple.push(lineIndex);
            this.adjList[node].push(triple);
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