class AcGameMenu{
    constructor(root){
        this.root = root;
        this.$menu = $(`
        <div class="ac-game-menu">
            <div class="ac-game-menu-field">
                 <div class="ac-game-menu-field-item ac-game-menu-field-item-single">
                 单人模式
                 </div>
                 <br>
                <div class="ac-game-menu-field-item ac-game-menu-field-item-multi">
                 多人模式
                 </div>
                 <br>
                 <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
                 设置
                 </div>
            </div>
        </div>
         `);
        this.root.$ac_game.append(this.$menu);
        this.$single = this.$menu.find('ac-game-menu-field-item-single');
        this.$multi = this.$menu.find('ac-game-menu-field-item-multi');
        this.$settings = this.$menu.find('ac-game-menu-field-item-settings');
    }
}


class AcGame {
        constructor(id){
            this.id=id;
            this.$ac_game = $('#'+id);
            this.menu=new AcGameMenu(this);





        }
}
