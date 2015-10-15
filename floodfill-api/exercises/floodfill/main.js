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


    var arrows  = [] //I couldn't find a better way to wipe the arrows.
                    // I'll explain when we meet up.

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
        initialRow: 0,
        initialCol: 0,
        curRow:     0,
        curCol:     0,
        init: function(row, col) {
            ff.nextStack.push({ row: row, col: col, depth: 0 });
            ff.initialRow = row; //I added these lines too
            ff.initialCol = col;
            ff.curRow = row;
            ff.curCol = col;
        },
        next: function() {
            if (ff.nextStack.length === 0) {
                ff.curRow = ff.initialRow//I put this there
                ff.curCol = ff.initialCol//I put this there
                return DONE;
            }
            var cur = ff.nextStack.pop();
            var row = cur.row;
            var col = cur.col;
            if (row < 0 || row >= model.cols || col < 0 || col >= model.cols) {
                return OFF_BOARD;
            }
            if (model.board[row][col] === null) {
                //ff.curRow = row; //me again
                //ff.curCol = col; //yep, it's late.
                //drawAll();
                return BLOCKED;
            }
            if (model.board[row][col].visited) {
                //ff.curRow = row; //man, I'm tired
                //ff.curCol = col; //So tired.
                //drawAll();
                return FILLED;
            }
            //I wrote this
            ff.curRow = cur.row;
            ff.curCol = cur.col;
            //Up to here
            var curFrame = model.board[cur.row][cur.col];
            curFrame.direction = cur.direction //I added this
            curFrame.depth = cur.depth //And this
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
                next.depth = cur.depth + 1; //Also this
                ff.nextStack.push(next);
            }
            drawAll();
            return MOVED;
        },
        reset: function(){
            for (var row = 0; row < model.rows; row++) {
                for(var col = 0; col < model.cols; col++){
                    cell = model.board[row][col];
                    if (cell != null) {
                        cell.visited = false;
                        cell.depth = 0;
                    };
                }
            };
            for (var i = 0; i < arrows.length; i++) {
                arrows[i].remove()
            };
                ex.stopTimer(onTimer);
                playButton.text("play")
                ff.init(ff.initialRow, ff.initialCol);
                drawAll();
        }
    };

    //Draws the arrows
    var drawArrow = function(dir, startx, starty, width, height){
                var img = "star.png";
                var endx = startx;
                var endy = starty;
        switch(dir){
            case UP:
                endx = startx + width/4;
                endy = starty+ 3*height/4;
                img = "up.png";
                break;
            case DOWN:
                endx = startx + width/4;
                endy = starty - height/4;
                img = "down.png";
                break;
            case LEFT:
                endx = startx + 3*width/4;
                endy = starty + height/4;
                img = "left.png";
                break;
            case RIGHT:
                endx = startx - width/4;
                endy = starty + height/4;
                img = "right.png";
                break;
            default:
                endx = startx + width/4
                endy = starty + height/4
                break;
            }
            arrows.push(ex.createImage(endx,endy,img,{
                width: (width/2).toString()+"px",
                height: (height/2).toString()+"px"
            }));

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

    //Draw the grid
    var drawGrid = function(){
        var width = (ex.width()/2)/model.cols;
        var height = (5*ex.height()/7)/model.rows;
        var margin = 20
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                var cell = model.board[row][col];
                var xpos = col*width
                var ypos = row*height
                if (row == ff.curRow && col == ff.curCol) {
                    ex.graphics.ctx.strokeStyle = "rgb(0,255,0)"
                    ex.graphics.ctx.lineWidth = 5;
                } else {
                    ex.graphics.ctx.strokeStyle = "black"
                    ex.graphics.ctx.lineWidth = 1
                };
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

    //Buttons
        //Next step button
    var nextButton = ex.createButton(3*ex.width()/8, 4*ex.height()/5, "next",{
        width: "40px",
        height: "20px"
    }).on("click", function(){
        ff.next();
    });
        //Play and Pause button
    var playButton = ex.createButton(2*ex.width()/8, 4*ex.height()/5, "play",{
        width: "40px",
        height: "20px"
    })
    playButton.on("click", function(){
        if (playButton.text() == "play") {
        onTimer = ex.onTimer(200,function () { 
                    ff.next();
                });
        playButton.text("pause");
        } else {
            ex.stopTimer(onTimer);
            playButton.text("play")
        };
    });
        //Reset Button
    var resetButton = ex.createButton(ex.width()/8, 4*ex.height()/5, "reset",{
        width: "40px",
        height: "20px"
        }).on("click", function(){
                    ff.reset();
        });

    var drawAll = function(){
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        for (var i = 0; i < arrows.length; i++) {
            arrows[i].remove()
        };
        drawGrid();
    }

    ex.chromeElements.resetButton.on("click", function(){ff.reset();})
    //End of buttons


    var code = ex.createCode(3*ex.width()/5, 20,
        "#Code\n\n\n\n\
        floodfill(UP)\n\n\n\
        floodfill(RIGHT)\n\n\n\
        floodfill(DOWN)\n\n\n\
        floodfill(LEFT)",
        {size:"large",
        height: (2*ex.height()/3).toString()+"px",
        width: (ex.width()/3).toString()+"px"}
        );

    ff.init(2,2); 
    drawAll();



    //while(ff.next()!=DONE){};

};

