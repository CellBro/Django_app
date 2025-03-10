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

        this.mode=mode;
        this.state = "waiting"; //waiting -> fighting -> over

        this.width =this.$playground.width();
        this.height=this.$playground.height();
        this.game_map= new GameMap(this);
        this.notice_board = new NoticeBoard(this);
        this.player_count = 0;

        this.resize();

        this.players=[];

        this.players.push(new Player(this,this.width/this.scale/2.0,0.5,0.05,"white",0.15,"me",this.root.settings.username,this.root.settings.photo));

        if(mode === "single_mode"){
        for(let i=0;i<5;i++){
        this.players.push(new Player(this,this.width/this.scale/2.0,0.5,0.05,this.get_random_color(),0.15,"robot"));
        }
        }else if (mode === "multi_mode"){
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username,outer.root.settings.photo);
            };

        }


    }

    hide(){
        this.$playground.hide();
    }

}


