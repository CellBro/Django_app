
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


