/**
 * 爆裂ブロック JavaScript版 ver0.01
 * http://bakuretuken.com/block/を改修してmetamask連結をつけたもの
 * MITライセンス
 */

// Config Init
if (typeof BLOCK_GAME_WIDTH == 'undefined') var BLOCK_GAME_WIDTH = 600;
if (typeof BLOCK_GAME_HEIGHT == 'undefined') var BLOCK_GAME_HEIGHT = 800;
if (typeof BLOCK_GAME_FPS == 'undefined') var BLOCK_GAME_FPS = 24;
if (typeof BLOCK_GAME_BALL_SPEED == 'undefined') var BLOCK_GAME_BALL_SPEED = 10;
if (typeof BLOCK_BAR_MARGIN_BOTTOM == 'undefined') var BLOCK_BAR_MARGIN_BOTTOM = 80;
if (typeof BLOCK_GAME_BLOCK_SIZE == 'undefined') var BLOCK_GAME_BLOCK_SIZE = 32; // 16 or 32
if (typeof BLOCK_GAME_MIN_BLOCK_PIXEL == 'undefined') {
    if (BLOCK_GAME_BLOCK_SIZE == 32) {
        var BLOCK_GAME_MIN_BLOCK_PIXEL = 24;
    } else {
        var BLOCK_GAME_MIN_BLOCK_PIXEL = 6;
    }
}
// console.log("BLOCK_GAME_MIN_BLOCK_PIXEL: "+BLOCK_GAME_MIN_BLOCK_PIXEL);

enchant();
var game = new Game(BLOCK_GAME_WIDTH, BLOCK_GAME_HEIGHT);
//ブロック、背景、勝利、ゲームスタート文字、ボール、反射パネル

var ImageFolder=".\\image\\";

var blockimage=ImageFolder+"test1.png";
var backimage=ImageFolder+"test2.png";
var winimage=ImageFolder+"block_image_win.jpg";
var startimage=ImageFolder+"block_icon_menu.png";
var ballimage=ImageFolder+"block_icon_boll.png";
var panelimage=ImageFolder+"block_icon_panel.png";

//game.preload("test1.png", "test2.jpg", "block_image_win.jpg", "block_icon_menu.png", "block_icon_boll.png", "block_icon_panel.png");
game.preload(blockimage,backimage,winimage,startimage,ballimage,panelimage);
game.fps = BLOCK_GAME_FPS;
game.mode = 0; // WAIT FIRST START

game.lifeLabel = new Label();

var scene = new Scene();
var imgFront = new Image();
var imgBack = new Image();
var imgWin = new Image();
var sf = new Surface(BLOCK_GAME_WIDTH, BLOCK_GAME_HEIGHT);

var touchPos = -1;

var blockBaseNum = 0;
var blockBaseNumMaster = 0;

var blockBase = new Array(BLOCK_GAME_WIDTH / BLOCK_GAME_BLOCK_SIZE);
for (k = 0; k < blockBase.length; k++) blockBase[k] = new Array(BLOCK_GAME_HEIGHT / BLOCK_GAME_BLOCK_SIZE);
var blockBaseMaster = new Array(BLOCK_GAME_WIDTH / BLOCK_GAME_BLOCK_SIZE);
for (k = 0; k < blockBaseMaster.length; k++) blockBaseMaster[k] = new Array(BLOCK_GAME_HEIGHT / BLOCK_GAME_BLOCK_SIZE);


// --- ラベル Sprite
StartLabelSprite = Class.create(Sprite,
{
    initialize:function()
    {
        Sprite.call(this, 512, 128);
        this.image = game.assets[startimage];
        this.init();
    },
    init:function()
    {
        this.frame = 0;
        this.x = (BLOCK_GAME_WIDTH/2) - (this.width/2);
        this.y = (BLOCK_GAME_HEIGHT/2) - (this.height/2);
    },
    ontouchstart:function(e)
    {
        if (game.mode == 0) gameStart();
        if (game.mode == 9 || game.mode == 10) gameRestart();
    }
});

// --- ゲーム画面 Sprite
SpriteScreen = Class.create(Sprite,
{
    initialize:function()
    {
        Sprite.call(this, BLOCK_GAME_WIDTH, BLOCK_GAME_HEIGHT);
    },
    // スマホの反射板移動
    ontouchstart:function(e)
    {
        touchPos = e.x;
    },
    ontouchendt:function(e)
    {
        touchPos = -1;
    },
    ontouchmove:function(e)
    {
        if (touchPos == -1) return;
        var posDiff = e.x - touchPos;
        touchPos = e.x;
        game.bar.x = game.bar.x + posDiff;
        if (game.bar.x < 0) game.bar.x = 0;
        if (game.bar.x > BLOCK_GAME_WIDTH - 120) game.bar.x = BLOCK_GAME_WIDTH - 120;
        if (game.mode == 0) { game.bomb.ox = game.bar.x +  (120 / 2); game.bomb.x = game.bomb.ox -10; }
        // game.bar.x = e.x - (game.bar.width / 2);
        // if (game.mode == 0) { game.bomb.ox = e.x; game.bomb.x = game.bomb.ox -10; }
    }
});

// --- ボール Sprite
Bomb = Class.create(Sprite,
{
    initialize:function()
    {
        Sprite.call(this, 22, 22);
        this.image = game.assets[ballimage];
        this.init();
    },
    init:function()
    {
        this.frame = 0;
        this.ox = (120 / 2) + 10;
        this.oy = BLOCK_GAME_HEIGHT - BLOCK_BAR_MARGIN_BOTTOM - 20;
        this.x = this.ox -10;
        this.y = this.oy - 10;
        this.vy = 0;
        this.vx = 0;
    },
    onenterframe:function()
    {
        if (game.mode != 1) return;

        if (this.move()) {
            this.ox = this.ox + this.vx;
            this.oy = this.oy + this.vy;

            this.x = this.ox -10;
            this.y = this.oy - 10;
        }
    },
    move:function()
    {
        var rtnFlag = true;
        if (game.bar.time > 0) game.bar.time--;
        if (game.bar.time == 0) game.bar.frame = 0;

        if (this.ox < 10) {
            this.ox = 10;
            this.vx = -this.vx;
            rtnFlag = false;
        }
        if (this.ox > BLOCK_GAME_WIDTH - 10) {
            this.ox = BLOCK_GAME_WIDTH - 10;
            this.vx = -this.vx;
            rtnFlag = false;
        }
        if (this.oy < 10) {
            this.oy = 10;
            this.vy = -this.vy;
            rtnFlag = false;
        }

        // Bar Hit
        if (this.intersect(game.bar)) {
            this.vy = -this.vy;
            game.bomb.frame = 0;
            game.bar.frame = 1;
            game.bar.time = 3;
            this.oy = BLOCK_GAME_HEIGHT - BLOCK_BAR_MARGIN_BOTTOM - 12;
            if (game.bar.x + 30 > this.ox) {
                if (this.vx > 0) {
                    if (this.vx > 0) this.vx = BLOCK_GAME_BALL_SPEED; else this.vx = -1 * BLOCK_GAME_BALL_SPEED;
                    if (this.vy > 0) this.vy = BLOCK_GAME_BALL_SPEED; else this.vy = -1 * BLOCK_GAME_BALL_SPEED;
                } else {
                    if (this.vx > 0) this.vx = BLOCK_GAME_BALL_SPEED + 3; else this.vx = -1 *( BLOCK_GAME_BALL_SPEED + 3);
                    if (this.vy > 0) this.vy = BLOCK_GAME_BALL_SPEED - 3; else this.vy = -1 * (BLOCK_GAME_BALL_SPEED - 3);
                }
            }
            if (game.bar.x + 90 < this.ox) {
                if (this.vx < 0) {
                    if (this.vx > 0) this.vx = BLOCK_GAME_BALL_SPEED; else this.vx = -1 * BLOCK_GAME_BALL_SPEED;
                    if (this.vy > 0) this.vy = BLOCK_GAME_BALL_SPEED; else this.vy = -1 * BLOCK_GAME_BALL_SPEED;
                } else {
                    if (this.vx > 0) this.vx = BLOCK_GAME_BALL_SPEED + 3; else this.vx = -1 *( BLOCK_GAME_BALL_SPEED + 3);
                    if (this.vy > 0) this.vy = BLOCK_GAME_BALL_SPEED - 3; else this.vy = -1 * (BLOCK_GAME_BALL_SPEED - 3);
                }
            }
            if (game.bar.x + 58 < this.ox && this.ox < game.bar.x + 62) {
                game.bomb.frame = 1;
            }
        }

        if (this.oy > BLOCK_GAME_HEIGHT - 10) {
            gameLose();
            return false;
        }

        if (parseInt((this.ox + this.vx) / BLOCK_GAME_BLOCK_SIZE) >= (BLOCK_GAME_WIDTH / BLOCK_GAME_BLOCK_SIZE)) return true;

        var posX = parseInt((this.ox + this.vx) / BLOCK_GAME_BLOCK_SIZE);
        var posY = parseInt(this.oy / BLOCK_GAME_BLOCK_SIZE);

        if (blockBase[posX][posY]) {
            blockBase[posX][posY] = false;
            blockBaseNum--;
            console.log("[BakuretuBlock] Block: "+blockBaseNum);
            drawBackImage(posX, posY);
            if (blockBaseNum == 0) { gameWin(); return false; }
            if (game.bomb.frame == 0) {
                this.vx = -this.vx;
                rtnFlag = false;
            }
        }

        if (parseInt((this.oy + this.vy) / BLOCK_GAME_BLOCK_SIZE) >= (BLOCK_GAME_HEIGHT / BLOCK_GAME_BLOCK_SIZE)) return true;

        var posX = parseInt(this.ox / BLOCK_GAME_BLOCK_SIZE);
        var posY = parseInt((this.oy + this.vy) / BLOCK_GAME_BLOCK_SIZE);

        if (blockBase[posX][posY]) {
            blockBase[posX][posY] = false;
            blockBaseNum--;
            console.log("[BakuretuBlock] Block: "+blockBaseNum);
            drawBackImage(posX, posY);
            if (blockBaseNum == 0) { gameWin(); return false; }
            if (game.bomb.frame == 0) {
                this.vy = -this.vy;
                rtnFlag = false
            }
        }

        return rtnFlag;
    }
});

// --- PanelBar Sprite
PanelBar = Class.create(Sprite,
{
    initialize:function()
    {
        Sprite.call(this, 120, 16);
        this.image = game.assets[panelimage];
        this.init();
    },
    init:function()
    {
        this.x = 10;
        this.y = BLOCK_GAME_HEIGHT - BLOCK_BAR_MARGIN_BOTTOM;
        this.time = 0;
    }
});

// --- main
window.onload = function()
{
    game.onload = function()
    {
    imgFront = game.assets[blockimage]._element;
    imgBack = game.assets[backimage]._element;
    imgWin = game.assets[winimage]._element;

    // ゲームスタート・リスタート ボタン
    game.restart = new StartLabelSprite();

    game.bomb = new Bomb();
    game.bar = new PanelBar();
    game.spriteScreen = new SpriteScreen();

    // for PC Mouse
    // PCの反射板移動
    document.getElementById("enchant-stage").addEventListener("mousemove", function(e)
    {
        var debug = e.pageX - this.getBoundingClientRect().left - (game.bar.width / 2);
        game.bar.x = e.pageX - this.getBoundingClientRect().left - (game.bar.width / 2);

        if (game.bar.x < 0) game.bar.x = 0;
        if (game.bar.x > BLOCK_GAME_WIDTH - 120) game.bar.x = BLOCK_GAME_WIDTH - 120;

        if (game.mode == 0) { game.bomb.ox = game.bar.x +  (120 / 2); game.bomb.x = game.bomb.ox -10; }
    }, false);
    document.getElementById("enchant-stage").addEventListener("click", function(e)
    {
        if (e.pageY < 150) return;
        if (game.mode == 0) gameStart();
        if (game.mode == 9) gameRestart();
    }, false);

    initGame();

    game.spriteScreen.image = sf;

    // 初回シーン実行
    scene.addChild(game.spriteScreen);
    scene.addChild(game.restart);
    scene.addChild(game.bar);
    scene.addChild(game.bomb);
    game.replaceScene(scene);

    }; // End of game.onload

    game.start();
};

function initGame()
{
    sf.context.drawImage(imgFront, 0, 0);

    blockBaseNum = 0;
    blockBaseNumMaster = 0;
    for (y = 0; y < BLOCK_GAME_HEIGHT / BLOCK_GAME_BLOCK_SIZE; y++) {
        for (x = 0; x < BLOCK_GAME_WIDTH / BLOCK_GAME_BLOCK_SIZE; x++) {
            blockBase[x][y] = false;
            blockBaseMaster[x][y] = false;
            if (haveBlock(sf.context, x, y)) {
                blockBase[x][y] = true;
                blockBaseMaster[x][y] = true;
                blockBaseNum++;
                blockBaseNumMaster++;
            }
        }
    }

    console.log("[BakuretuBlock] Init Block: "+blockBaseNum);

    sf.context.drawImage(imgBack, 0, 0);
    sf.context.drawImage(imgFront, 0, 0);

//    game.spriteScreen.image = sf;
};

function haveBlock(ctx, x, y)
{
    var num = 0, i = 0;
    var imageData = ctx.getImageData(x*BLOCK_GAME_BLOCK_SIZE, y*BLOCK_GAME_BLOCK_SIZE, BLOCK_GAME_BLOCK_SIZE, BLOCK_GAME_BLOCK_SIZE);
    for (i = 0; i < BLOCK_GAME_BLOCK_SIZE*BLOCK_GAME_BLOCK_SIZE; i++) {
      if (imageData.data[i*4+3]) num++;
    }
    return (num >= BLOCK_GAME_MIN_BLOCK_PIXEL) ? true : false;
};

function drawBackImage(x, y)
{
    sf.context.drawImage(imgBack, x*BLOCK_GAME_BLOCK_SIZE, y*BLOCK_GAME_BLOCK_SIZE, BLOCK_GAME_BLOCK_SIZE, BLOCK_GAME_BLOCK_SIZE, x*BLOCK_GAME_BLOCK_SIZE, y*BLOCK_GAME_BLOCK_SIZE, BLOCK_GAME_BLOCK_SIZE, BLOCK_GAME_BLOCK_SIZE);
};

function gameStart()
{
    game.restart.y = -100; // HIDE
    // ボールに移動量
    game.bomb.vy = BLOCK_GAME_BALL_SPEED;
    game.bomb.vx = BLOCK_GAME_BALL_SPEED;
    game.mode = 1; // GAME NOW
};

function gameLose()
{
    // game.restart.x = (BLOCK_GAME_WIDTH/2) - (game.restart.width/2);
    // game.restart.y = (BLOCK_GAME_HEIGHT/2) - (game.restart.height/2);
    game.restart.x = 0;
    game.restart.y = 0;
    game.restart.frame = 1;

    // ボールに非表示＆移動量なし
    game.bomb.vy = 0;
    game.bomb.vx = 0;
    game.bomb.oy = -100;
    game.bomb.y = -100;

    game.mode = 9; // GAME LOSE
};

function gameWin()
{
    game.mode = 10; // GAME WIN

    game.restart.frame = 1;
    game.restart.x = 0;
    game.restart.y = 0;

    // ボールに非表示＆移動量なし
    game.bomb.vy = 0;
    game.bomb.vx = 0;
    game.bomb.oy = -100;
    game.bomb.y = -100;

    // パネル非表示
    game.bar.y = -100;

    sf.context.drawImage(imgWin, 0, 0);
};

function gameRestart()
{
    // ブロック配列復元
    blockBaseNum = blockBaseNumMaster;
    for (y = 0; y < BLOCK_GAME_HEIGHT / BLOCK_GAME_BLOCK_SIZE; y++) {
        for (x = 0; x < BLOCK_GAME_WIDTH / BLOCK_GAME_BLOCK_SIZE; x++) {
            blockBase[x][y] = blockBaseMaster[x][y];
        }
    }

    console.log("[BakuretuBlock] Restart Block: "+blockBaseNum);

    sf.context.drawImage(imgBack, 0, 0);
    sf.context.drawImage(imgFront, 0, 0);

    game.restart.init();
    game.bomb.init();
    game.bar.init();

    // gameStart();
    game.mode = 0; // WAIT GAME
};