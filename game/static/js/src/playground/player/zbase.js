class Player extends AcGameObject {
    constructor(playground,x,y,radius,color,speed,is_me){
        super();
        this.x = x;
        this.y = y;
        this.vx=1;
        this.vy=1;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.eps = 0.1;


    }

    start(){
    }
    update(){
        this.x += this.vx;
        this.y += this.vy;
        this.render();

    }


    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();

    }




}
