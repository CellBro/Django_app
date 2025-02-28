class AcGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-field">
                 <div class="ac-game-menu-field-item ac-game-menu-field-item-single-mode">
                 单人模式
                 </div>
                 <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
                 多人模式
                 </div>
                 <br>
                 <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                 退出
                 </div>
            </div>
        </div>
         `);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');
        this.start();
    }
    start(){
        this.add_listening_events();
    }
    add_listening_events(){
        let outer=this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");

        });
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    show()
    {
        this.$menu.show();
    }

    hide()
    {
        this.$menu.hide();

    }


}

let AC_GAME_OBJECTS = [];


class AcGameObject{
    constructor(){
        AC_GAME_OBJECTS.push(this);
        this.has_called_start =false;
        this.timedelta =0 ; //距离上一帧的时间间隔
        this.uuid = this.create_uuid();
    }
    create_uuid(){
        let res = "" ;
        for (let i=0;i<16;i++){
            let x = parseInt(Math.floor(Math.random()*10));
            res+=x;
        }
        return res;
    }

    start()
    {

    }

    update()
    {

    }

    on_destroy(){

    }

    destroy(){
        this.on_destroy();
        for(let i=0;i<AC_GAME_OBJECTS.length;i++){
            if(AC_GAME_OBJECTS[i]===this){
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }


        }

    }
}

let last_timestamp;

let AC_GAME_ANIMATION = function(timestamp){

for(let i=0;i<AC_GAME_OBJECTS.length;i++){
        let obj = AC_GAME_OBJECTS[i];
            if(!obj.has_called_start)
            {
                obj.start();
                obj.has_called_start=true;

            }
            else{
                obj.timedelta =timestamp - last_timestamp;
                obj.update();
            }

        }
        last_timestamp=timestamp;
        requestAnimationFrame(AC_GAME_ANIMATION);

}
requestAnimationFrame(AC_GAME_ANIMATION);


class GameMap extends AcGameObject {
    constructor(playground){
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx=this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
    }

    start(){
    }

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
    }

    update(){
        this.render();

    }
    render(){
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);

    }


}
class Particle extends AcGameObject {
    constructor(playground,x,y,radius,vx,vy,color,speed,move_length){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.01;
    }

    start(){}

    update(){
        if(this.move_length < this.eps || this.speed < this.eps)
        {
            this.destroy();
            return false;
        }
        let moved = Math.min(this.move_length,this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *=this.friction;
        this.move_length -= moved;
        this.render();
    }

    render(){
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();


    }





}
class Player extends AcGameObject {
    constructor(playground,x,y,radius,color,speed,character,username,photo){
        super();
        this.x = x;
        this.y = y;
        this.vx=0;
        this.vy=0;
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed =  0;
        this.move_length = 0;
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.eps = 0.01;
        this.friction = 0.9;
        this.cur_skill = null;

        if(this.character !== "robot"){
            this.img = new Image();
            this.img.src = this.photo;
        }

        this.silent_time = 0.0;


    }

    start(){
        if(this.character === "me")
        {
            this.add_listening_events();
        }else
        {
            let tx = Math.random() * this.playground.width/this.playground.scale;
            let ty = Math.random() * this.playground.height/this.playground.scale;
            this.move_to(tx,ty);
        }
    }

    add_listening_events(){
        let outer=this;
        this.playground.game_map.$canvas.on("contextmenu",function(){
            return false;
        });
        this.playground.$playground.on("contextmenu",function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e){
        const rect = outer.ctx.canvas.getBoundingClientRect();
        if(e.which === 3 ){
                outer.move_to((e.clientX-rect.left)/outer.playground.scale,(e.clientY-rect.top)/outer.playground.scale);
            }
        else if(e.which === 1){
           if(outer.cur_skill === "fireball")
             {
                   if(outer.radius > outer.eps)
                    outer.shoot_fireball((e.clientX-rect.left)/outer.playground.scale,(e.clientY-rect.top)/outer.playground.scale);
             }
            }
            outer.cur_skill = null;

        });

        $(window).keydown(function(e){
            if(e.which === 81 ) //q
            {
               
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx,ty){
        let x = this.x , y = this.y ;
        let radius = 0.01;
        let angle = Math.atan2(ty-this.y,tx-this.x);
        let vx = Math.cos(angle),vy = Math.sin(angle);
        let color = "orange";
        let speed = 0.5;
        let move_length = 1;
        new FireBall(this.playground,this,x,y,radius,vx,vy,color,speed,move_length, 0.01);

    }

    get_dist(x1,y1,x2,y2){
        let dx=x1-x2;
        let dy=y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }

    move_to(tx,ty){
        this.move_length = this.get_dist(this.x,this.y,tx,ty);
        let angle = Math.atan2(ty-this.y,tx-this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle,damage){

        for(let i=0 ; i< 10 + Math.random()*10;i++ )
        {
            let x = this.x;
            let y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 *Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed *4;
            let move_length = this.radius*Math.random()*5;
            new Particle(this.playground,x,y,radius,vx,vy,color,speed,move_length);

        }

        this.radius -=damage;

        if(this.radius < this.eps){
            this.destroy();
            return false;
        }

        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage*100;
        this.speed *=1.7;

    }

    update_move(){ //更新移动

            this.silent_time += this.timedelta/1000

            if(this.character === "robot"&&this.silent_time>2&&Math.random()< 1/500.0)
            {
                if(this.playground.players.length > 1)
                {
                    let player= this.player;
                    do{
                        let select = Math.floor(Math.random()*this.playground.players.length);
                        player = this.playground.players[select];
                    }while(player === this.player)
                    this.shoot_fireball(player.x,player.y);
                }
                else{}
            }

        if(this.damage_speed > this.eps){
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x *this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000 ;
            this.damage_speed *= this.friction;
        }
        else
        {
            if(this.move_length < this.eps)
            {
                this.move_length =0;
                this.vx = this.vy = 0 ;
                if(this.character === "robot")
                {
                    let tx = Math.random() * this.playground.width/this.playground.scale;
                    let ty = Math.random() * this.playground.height/this.playground.scale;
                    this.move_to(tx,ty);
                }
            }
            else
            {
                let moved = Math.min(this.move_length,this.speed*this.timedelta/1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render(){
        let scale = this.playground.scale;

        if(this.character !== "robot"){
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img,(this.x-this.radius)*scale,(this.y-this.radius)*scale,this.radius*2*scale,this.radius*2*scale);
            this.ctx.restore();
        }
        else{
        this.ctx.beginPath();
        this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        }
    }

    update(){
        this.update_move();
        this.render();
    }


    on_destroy(){
        for(let i=0 ; i < this.playground.players.length ; i++)
            if(this.playground.players[i] == this)
            {
                this.playground.players.splice(i,1);
            }
    }



}
class FireBall extends AcGameObject{
    constructor(playground , player,x,y,radius,vx,vy,color,speed,move_length,damage){
        super();
        this.playground = playground;
        this.player = player;

        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;

        this.color = color;
        this.speed = speed;
        this.move_length =move_length;
        this.damage = damage;

        this.eps = 0.01;


    }

    start(){}

    update(){
        if(this.move_length < this.eps){
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length,this.speed * this.timedelta/1000);
        this.x += this.vx * moved;
        this.y +=this.vy * moved;
        this.move_length -=moved;

        for(let i=0;i<this.playground.players.length;i++){
            let player = this.playground.players[i];
            if (this.player !== player &&this.is_collision(player)){
                this.attack(player);
            }
        }

        this.render();
    }
    get_dist(x1,y1,x2,y2){
        let dx = x1-x2;
        let dy = y1-y2;
        return Math.sqrt(dx*dx+dy*dy);
    }

    is_collision(player){
        let distance = this.get_dist(this.x,this.y,player.x,player.y)
        if(distance < this.radius + player.radius)
            return true;
        return false;

    }

    attack(player){
        let angle = Math.atan2(player.y-this.y,player.x-this.x);
        player.is_attacked(angle,this.damage);
        this.destroy();
        return false;
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x*scale,this.y*scale,this.radius*scale,0,Math.PI*2,false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();


    }




}
class MultiPlayerSocket{
    constructor(playground){
        this.playground = playground;
        this.ws = new WebSocket("wss://app6069.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();

    }
    start(){
    }
    send_create_player(){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event':"create_player",
            'uuid':outer.uuid,
        }));
    }

}
class AcGamePlayground{
    constructor(root){
        this.root=root;
        this.$playground=$(`
        <div class="ac-game-playground"></div>

        `);
        this.root.$ac_game.append(this.$playground  )
        this.hide();


        this.start();


    }
    get_random_color(){
        let colors = ["blue","red","pink","green","grey"];
        return colors[Math.floor(Math.random()*5)];
    }
    start(){
        let outer=this;
        $(window).resize(function(){
            outer.resize();
        });

    }
    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width/16,this.height/9);
        this.width = unit*16;
        this.height = unit*9;
        this.scale = this.height; // 以游戏窗口作为单位“1”

        if(this.game_map) this.game_map.resize();
    }

    show(mode){
        let outer = this;
        this.$playground.show();


        this.width =this.$playground.width();
        this.height=this.$playground.height();
        this.game_map= new GameMap(this);

        this.resize();

        this.players=[];

        this.players.push(new Player(this,this.width/this.scale/2.0,0.5,0.05,"white",0.15,"me",this.root.settings.username,this.root.settings.photo));

        if(mode === "single mode"){
        for(let i=0;i<5;i++){
        this.players.push(new Player(this,this.width/this.scale/2.0,0.5,0.05,this.get_random_color(),0.15,"robot"));
        }
        }else if (mode === "multi mode"){
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function(){
                outer.mps.send_create_player();
            };

        }


    }

    hide(){
        this.$playground.hide();
    }

}


class Settings
{
	constructor(root){
		this.root=root;
        this.username= "";
        this.photo = "";
		this.platform = "WEB";
		if(this.root.AcWingOS)
			this.platform = "ACAPP";
        this.$settings= $(
`
<div class = "ac-game-settings">


    <div class = "ac-game-settings-login">

        <div class = "ac-game-settings-title">
            登录
        </div>

        <div class="ac-game-settings-username">

            <div class="ac-game-settings-item">
            <input type="text" placeholder="用户名">
            </div>

        </div>

        <div class= "ac-game-settings-password">

            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>

        </div>

        <div class="ac-game-settings-submit">

            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>

        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class = "ac-game-settings-option">
             注册
        </div>
        <br>

        <div class="ac-game-settings-acwing">
            <img src="https://app6069.acapp.acwing.com.cn/static/image/settings/acwing_logo.png" alt="AcWing_Logo" width="30">
            <div>
            AcWing一键登录
            </div>
        </div>

    </div>


    <div class = "ac-game-settings-register">

        <div class = "ac-game-settings-title">
           注册
        </div>

        <div class="ac-game-settings-username">

            <div class="ac-game-settings-item">
            <input type="text" placeholder="请输入用户名">
            </div>

        </div>

        <div class= "ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="请输入密码">
            </div>
        </div>

        <div class= "ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="请再次输入密码">
            </div>
        </div>


        <div class="ac-game-settings-submit">

            <div class="ac-game-settings-item">
                <button>注册 </button>
            </div>

        </div>

        <div class="ac-game-settings-error-message">
        </div>

        <div class = "ac-game-settings-option">
             登录
        </div>

        <br> 

        <div class="ac-game-settings-acwing">
            <img src="https://app6069.acapp.acwing.com.cn/static/image/settings/acwing_logo.png" alt="AcWing_Logo" width="30">
            <div>
            AcWing一键登录
            </div>
            
        </div>

    </div>
</div>
`
        );

        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");
        this.$register.hide();

        this.$acwing_login = this.$settings.find(".ac-game-settings-acwing img");
        this.root.$ac_game.append(this.$settings);
		this.start();

	}
    register(){
        this.$login.hide();
        this.$register.show();
    }

    login(){
        this.$register.hide();
        this.$login.show();
    }
    acwing_login(){
        console.log("Click AcWing login");
        $.ajax({
            url:"https://app6069.acapp.acwing.com.cn/settings/acwing/web/apply_code",
            type:"GET",
            success:function(resp){
                console.log(resp);
                if(resp.result === "success"){
                    window.location.replace(resp.apply_code_url);
                }
            }
    });
    }

    add_listening_events_login(){
        let outer=this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_on_remote();
        })
    }
    
    add_listening_events_register(){
        let outer=this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_on_remote();
        });
    }
    add_listening_events_acwing_login() {
        let outer = this;
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    add_listening_events(){
        this.add_listening_events_register();
        this.add_listening_events_login();
        this.add_listening_events_acwing_login();

    }

    login_on_remote(){
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();
        $.ajax({
            url:"https://app6069.acapp.acwing.com.cn/settings/login/",
            type:"GET",
            data:{
                username:username,
                password:password,
            },
            success:function(resp){
                console.log(resp);
                if(resp.result === "success")
                {
                    location.reload();
                }
                else{
                    outer.$login_error_message.html(resp.result);
                }
            }



        });


    }

    logout_on_remote(){
        if(this.platform==="ACAPP") return false;
        $.ajax({
            url:"https://app6069.acapp.acwing.com.cn/settings/logout/",
            type:"GET",
            data:{

            },
            success:function(resp){
                console.log(resp);
                location.reload();
                 
            }
        });
    }

    register_on_remote(){
        let outer =this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();
        $.ajax({
            url:"https://app6069.acapp.acwing.com.cn/settings/register/",
            type:"GET",
            data:{
                username:username,
                password:password,
                password_confirm:password_confirm,
            },
            success:function(resp){
                if(resp.result === "success")
                    location.reload();
                else{
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }



	getinfo(){
        let outer = this;
		$.ajax({
			url:"https://app6069.acapp.acwing.com.cn/settings/getinfo/",
			type:"GET",
			data:{
				platform: outer.platform,
			},
            success: function(resp){
                console.log(resp);
                if(resp.result === "success")
                {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else
                {
                    outer.login();
                }
            }
		}
		);
	}
        hide(){
            this.$settings.hide();
        }
        show(){
            this.$settings.show();
        }
        start(){
            this.getinfo();
            this.add_listening_events();
        }



}
export class AcGame {
        constructor(id,AcWingOS){
            this.id=id;
            this.$ac_game = $('#'+id);
            this.AcWingOS = AcWingOS;
            this.settings = new Settings(this);
            this.menu=new AcGameMenu(this);
            this.playground=new AcGamePlayground(this);
            this.start();





        }
    start()
    {
    }
}
