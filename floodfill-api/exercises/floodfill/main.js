var main = function(ex) {
    window.ex = ex;

    /* Directions */
    var UP      = 'up';
    var DOWN    = 'down';
    var RIGHT   = 'right';
    var LEFT    = 'left';

    /* Return statuses */
    var OFF_BOARD   = 'off';
    var FILLED      = 'fill';
    var BLOCKED     = 'block';
    var MOVED       = 'move';
    var DONE        = 'done';

    /* Initialize our model fields */
    var model = {};
    var initModel = function() {
        if (typeof ex.data.model !== 'undefined') {
            model = ex.data.model;
            return;
        }
        model.rows = 5;
        model.cols = 5;
        var initBoard = function(rows, cols) {
            var board = [];
            for (var i = 0; i < rows; i++) {
                var row = []
                for (var j = 0; j < cols; j++) {
                    if (Math.random() < 0.1) {
                        row.push(null);
                    } else {
                        row.push({
                            visited: false,
                            depth: 0,
                            direction: null,
                            row: i,
                            col: j   
                        });
                    }
                }
                board.push(row);
            }
            return board;
        };
        model.board = initBoard(model.rows, model.cols);
        model.dirOrder = [UP, RIGHT, DOWN, LEFT];
        ex.data.model = model;
    };
    initModel();
    
    /* The floodfill object */
    var ff = {
        nextStack: [],
        prevStack: [],
        init: function(row, col) {
            ff.nextStack.push({ row: row, col: col, depth: 0 });
        },
        next: function() {
            if (ff.nextStack.length === 0) {
                return DONE;
            }
            var cur = ff.nextStack.pop();
            var row = cur.row;
            var col = cur.col;
            if (row < 0 || row >= model.cols || col < 0 || col >= model.cols) {
                return OFF_BOARD;
            }
            if (model.board[row][col] === null) {
                return BLOCKED;
            }
            if (model.board[row][col].visited) {
                return FILLED;
            }
            var curFrame = model.board[cur.row][cur.col];
            curFrame.direction = cur.direction
            curFrame.depth = cur.depth
            curFrame.visited = true;
            ff.prevStack.push(cur);
            for (var i = 0; i < model.dirOrder.length; i++) {
                var dir = model.dirOrder[i];
                var next = {};
                switch (dir) {
                    case UP:
                        next.row = row-1;
                        next.col = col;
                        break;
                    case RIGHT:
                        next.row = row;
                        next.col = col+1;
                        break;
                    case DOWN:
                        next.row = row+1;
                        next.col = col;
                        break;
                    case LEFT:
                        next.row = row;
                        next.col = col-1;
                        break;
                }
                next.direction = dir;
                next.depth = cur.depth + 1;
                ff.nextStack.push(next);
            }
            drawGrid();
            return MOVED;
        }
    };

    var drawArrow = function(dir, startx, starty, width, height){
                var img = "star.png";
                var endx = startx;
                var endy = starty;
        switch(dir){
            case UP:
                endx = startx+width/2 - width/4;
                endy = starty+ height - height/4;
                img = "up.png";
                break;
            case DOWN:
                endx = startx+width/2 - width/4;
                endy = starty- height/4;
                img = "down.png";
                break;
            case LEFT:
                endx = startx+ width - width/4;
                endy = starty + height/2 - height/4;
                img = "left.png";
                break;
            case RIGHT:
                endx = startx - width/4;
                endy = starty + height/2 - height/4;
                img = "right.png";
                break;
            default:
                endx = startx + width/2 - width/4
                endy = starty + height/2 - height/4
                break;
            }
            var arrow = ex.createImage(endx,endy,img,{
                width: (width/2).toString()+"px",
                height: (height/2).toString()+"px"
            });

        }

    window.printBoard = function() {
        for (var i = 0; i < model.rows; i++) {
            for (var j = 0; j < model.cols; j++) {
                if (model.board[i][j] !== null) {
                    console.log(model.board[i][j].visited);
                }
            }
        }
    }


    var drawGrid = function(){
        var width = (ex.width()/2)/model.cols;
        var height = (ex.height()/2)/model.rows;
        var margin = 20
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                var cell = model.board[row][col];
                var xpos = col*width
                var ypos = row*height
                if (cell == null) {
                    ex.graphics.ctx.fillStyle = "black";
                    ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height);
                } else {
                    console.log(cell.depth)
                    ex.graphics.ctx.fillStyle = "rgb("+(250*cell.depth/(model.rows*model.cols/2)).toString()+",0,"+(255-250*cell.depth/(model.rows*model.cols)).toString()+")";
                                        if (cell.visited) {
                        ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height); 
                        drawArrow(cell.direction, xpos+margin, 
                                ypos+margin, width, height)
                        ex.graphics.ctx.strokeRect(xpos + margin,
                                                    ypos + margin,
                                                    width,
                                                    height);
                    } else {
                        ex.graphics.ctx.strokeRect(xpos + margin,
                                                ypos + margin,
                                                width,
                                                height);
                    };
                };
            };
        };
    };

var nextButton = ex.createButton(3*ex.width()/8, 4*ex.height()/5, "next",{
    width: "20px",
    height: "20px"
}).on("click", function(){
    ff.next();
});
var playButton = ex.createButton(2*ex.width()/8, 4*ex.height()/5, "play",{
    width: "20px",
    height: "20px"
}).on("click", function(){
    ex.onTimer(200,function () {   
                ff.next();
            });
});

    drawGrid();

    ff.init(2,2); 
    //while(ff.next()!=DONE){};

};

