export default class Circ {
    constructor(x, y, color){
        if(x === null && y === null){
            this.x = mouseX;
            this.y = mouseY;
        } else{
            this.x = x;
            this.y = y;
        }
        this.d = 30;
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