var main = function(ex) {
    window.ex = ex;
    ex.data.meta.mode = "demo"
    //ex.data.meta.mode = "assessment1"
    //ex.data.meta.mode = "assessment2"


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


    var margin = 20
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
                            fromDir: null,
                            visitedDirs: [],
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
        callStack: [],
        initialRow: 0,
        initialCol: 0,
        curRow:     0,
        curCol:     0,
        init: function(row, col) {
            ff.nextStack = [];
            ff.prevStack = [];
            ff.nextStack.push({
                row: row,
                col: col,
                depth: 0,
                code: model.dirOrder,
            });
            ff.initialRow = row; //I added these lines too
            ff.initialCol = col;
            ff.curRow = row;
            ff.curCol = col;
            ff.callStack = [];
            ff.prevCallStack = [];
            ff.next();
        },
        next: function() {
            if (ff.nextStack.length === 0) {
                ff.curRow = ff.initialRow;//I put this there
                ff.curCol = ff.initialCol;//I put this there
                return DONE;
            }
            var cur = ff.nextStack.pop();
            var row = cur.row;
            var col = cur.col;
            // Log the direction we came from
            if (typeof cur.direction !== 'undefined') {
                var dir = cur.direction;
                var from;
                switch (dir) {
                    case UP:
                        from = model.board[row+1][col];
                        break;
                    case RIGHT:
                        from = model.board[row][col-1];
                        break;
                    case DOWN:
                        from = model.board[row-1][col];
                        break;
                    case LEFT:
                        from = model.board[row][col+1];
                        break;
                }
                from.visitedDirs.push(dir);
            }
            if (row < 0 || row >= model.cols || col < 0 || col >= model.cols) {
                return OFF_BOARD;
            }
            if (model.board[row][col] === null) {
                //ff.curRow = row; //me again
                //ff.curCol = col; //yep, it's late.
                //drawAll();
                cur.success = false;
                ff.prevStack.push(cur);
                return BLOCKED;
            }
            if (model.board[row][col].visited) {
                //ff.curRow = row; //man, I'm tired
                //ff.curCol = col; //So tired.
                //drawAll();
                cur.success = false;
                ff.prevStack.push(cur);
                return FILLED;
            }
            //I wrote this
            ff.curRow = cur.row;
            ff.curCol = cur.col;
            cur.success = true;
            //Up to here
            var curFrame = model.board[cur.row][cur.col];
            curFrame.fromDir = cur.direction; //I added this
            curFrame.depth = cur.depth; //And this
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
                if(ex.data.meta.mode=="demo"){
                    ex.stopTimer(onTimer);
                    playButton.text("play")
                }
                ff.init(ff.initialRow, ff.initialCol);
        },
        stepBack: function(){
            if (ff.prevStack.length == 0){
                return DONE;
            }
            var last = ff.prevStack.pop();
            if (last.success){
                for (var i = 0; i < 4; i++) {
                    ff.nextStack.pop();  
                };
                model.board[last.row][last.col].visited = false;
                ff.curCol = last.col;
                ff.curRow = last.rows;
                ff.nextStack.push(last);
            }
        }
    };

    var drawFrame = function(frameDirs) {
        for (var i = 0; i < frameDirs.length; i++) {
            // something
        }
    };

    var drawArrow = function(context, fromx, fromy, tox, toy, color) {
        var headlen = 10;   // length of head in pixels
        var angle = Math.atan2(toy-fromy,tox-fromx);
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 1;
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        context.moveTo(tox, toy);
        context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
        context.stroke();
    };

    //Draw the grid
    var drawGrid = function(){
        var width = (ex.width()/2)/model.cols;
        var height = (5*ex.height()/7)/model.rows;
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                var cell = model.board[row][col];
                var xpos = col*width;
                var ypos = row*height;
                ex.graphics.ctx.strokeStyle = "black";
                ex.graphics.ctx.lineWidth = 1;
                if (cell === null) {
                    // Blocked cell
                    ex.graphics.ctx.fillStyle = "black";
                    ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height);
                } else {
                    ex.graphics.ctx.font = (ex.width()/35).toString()+"px Courier";
                    ex.graphics.ctx.fillStyle = "rgb("+
                        (250*cell.depth/(model.rows*model.cols/2)).toString()
                        +",0,"+
                        (255-250*cell.depth/(model.rows*model.cols)).toString()
                        +")";
                    if (cell.visited) {
                        // visited cell
                        ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height);
                        ex.graphics.ctx.strokeRect(xpos + margin,
                                                    ypos + margin,
                                                    width,
                                                    height);
                        ex.graphics.ctx.fillStyle = "white";
                        ex.graphics.ctx.textAlign = "end";
                        ex.graphics.ctx.fillText(
                            model.board[row][col].depth.toString(),
                            xpos + margin + width,
                            ypos + 2*margin);
                    } else {
                        // empty cell
                        ex.graphics.ctx.strokeRect(xpos + margin,
                                                ypos + margin,
                                                width,
                                                height);
                    }
                    // go through the visited dirs, make them bold
                    ex.graphics.ctx.beginPath();
                    ex.graphics.ctx.lineWidth = 5;
                    ex.graphics.ctx.strokeStyle = "white";
                    for (var i = 0; i < cell.visitedDirs.length; i++) {
                        var dir = cell.visitedDirs[i];
                        var x0, y0, x1, y1;
                        switch (dir) {
                            case UP:
                                x0 = xpos+margin+width/2;
                                y0 = ypos+margin+height/8;
                                x1 = x0;
                                y1 = y0-height/8;
                                // x0 = xpos+margin;
                                // y0 = ypos+margin+2.5;
                                // x1 = x0+width;
                                // y1 = y0;
                                break;
                            case DOWN:
                                x0 = xpos+margin+width/2;
                                y0 = ypos+margin+height-height/8;
                                x1 = x0;
                                y1 = y0+height/8;
                                // x0 = xpos+margin;
                                // y0 = ypos+margin+height-2.5;
                                // x1 = x0+width;
                                // y1 = y0;
                                break;
                            case RIGHT:
                                x0 = xpos+margin+width-width/8;
                                y0 = ypos+margin+height/2;
                                x1 = x0+width/8;
                                y1 = y0;
                                // x0 = xpos+margin+width-2.5;
                                // y0 = ypos+margin;
                                // x1 = x0;
                                // y1 = y0+height;
                                break;
                            case LEFT:
                                x0 = xpos+margin+width/8;
                                y0 = ypos+margin+height/2;
                                x1 = x0-width/8;
                                y1 = y0;
                                // x0 = xpos+margin+2.5;
                                // y0 = ypos+margin;
                                // x1 = x0;
                                // y1 = y0+height;
                                break;
                        }
                        // ex.graphics.ctx.moveTo(x0, y0);
                        // ex.graphics.ctx.lineTo(x1, y1);
                        // ex.graphics.ctx.stroke();
                        drawArrow(ex.graphics.ctx, x0, y0, x1, y1, 'black');
                    }
                }
            }
        }
        ex.graphics.ctx.beginPath();
        ex.graphics.ctx.strokeStyle = "rgb(0,255,0)";
        ex.graphics.ctx.lineWidth = 2;
        ex.graphics.ctx.strokeRect(ff.curCol*width+margin,
                               ff.curRow*height+margin,
                               width,
                               height); 
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                var cell = model.board[row][col];
                if (cell !== null && cell.visited &&
                    typeof cell.fromDir !== 'undefined' && cell.fromDir !== null) {
                    var xpos = col*width;
                    var ypos = row*height;
                    switch (cell.fromDir) {
                        case DOWN:
                            x0 = xpos+margin+width/2;
                            y0 = ypos+margin-height/4;
                            x1 = x0;
                            y1 = y0+height/2;
                            break;
                        case UP:
                            x0 = xpos+margin+width/2;
                            y0 = ypos+margin+height+height/4;
                            x1 = x0;
                            y1 = y0-height/2;
                            break;
                        case RIGHT:
                            x0 = xpos+margin-width/4;
                            y0 = ypos+margin+height/2;
                            x1 = x0+width/2;
                            y1 = y0;
                            break;
                        case LEFT:
                            x0 = xpos+margin+width+width/4;
                            y0 = ypos+margin+height/2;
                            x1 = x0-width/2;
                            y1 = y0;
                            break;
                    }
                    drawArrow(ex.graphics.ctx, x0, y0, x1, y1, 'white');
                }
            }
        }
    };

    //Check if the board is fully visited
    var checkFull = function(){
        for (var row = 0; row < model.rows; row++) {
            for(var col = 0; col < model.cols; col++){
                if(model.board[row][col] != null){
                    if(model.board[row][col].visited == false){return false};
                }
            }
        };
        return true;
    }

    //Buttons
        //Playthrough buttons
    if(ex.data.meta.mode == "demo" || ex.data.meta.mode == "assessment2"){
            //Next step button
        var nextButton = ex.createButton(3*ex.width()/8+margin,
                                         4*ex.height()/5, "next",{
            width: "40px",
            height: "20px"
        }).on("click", function(){
            ff.next();
            drawAll();
            ex.stopTimer(onTimer);
            playButton.text("play");
        });
            //Play and Pause button
        var playButton = ex.createButton(2*ex.width()/8+margin,
                                         4*ex.height()/5, "play",{
            width: "40px",
            height: "20px"
        })
        playButton.on("click", function(){
            if (playButton.text() == "play") {
            onTimer = ex.onTimer(500,function () { 
                        ff.next();
                        drawAll();
                    });
            playButton.text("pause");
            } else {
                ex.stopTimer(onTimer);
                playButton.text("play")
            };
        });


        var stepBackButton = ex.createButton(ex.width()/8+margin,
                                             4*ex.height()/5, "back",{
            width: "40px",
            height: "20px"
            }).on("click", function(){
                        ff.stepBack();
                        drawAll();
            });
        } 

            //Reset Button
        var resetButton = ex.createButton(margin,
                                          4*ex.height()/5, "reset",{
            width: "40px",
            height: "20px"
            }).on("click", function(){
                        ff.reset();
                        drawAll();
            });

    ex.chromeElements.resetButton.on("click", function(){ff.reset();})
    //End of buttons

    var code = {
        dirOrder : [],
        init     : function(){
            dirOrder = model.dirOrder
            if(ex.data.meta.mode == "assessment2"){

            }
        },
        draw: function(){
            ex.graphics.ctx.textAlign = "start"
            ex.graphics.ctx.font = (ex.width()/35).toString()+"px Courier";
            ex.graphics.ctx.fillStyle = "black"
            for (var i = dirOrder.length-1; i >=0; i--) {
                ex.graphics.ctx.fillText("floodfill("+dirOrder[i]+")",
                                         2*ex.width()/3, 
                                        (4-i)*ex.height()/6);
            };
        }
    }

    var drawAll = function(){
        ex.graphics.ctx.clearRect(0,0,ex.width(),ex.height());
        drawGrid();
        code.draw();
    };
    code.init();
    ff.init(Math.floor(Math.random()*model.rows),Math.floor(Math.random()*model.cols)); 
    drawAll();


    ex.graphics.on("mousedown", function(event){

        var width = (ex.width()/2)/model.cols;
        var height = (5*ex.height()/7)/model.rows;
        var x = event.offsetX - margin;
        var y = event.offsetY - margin;
        var col = Math.floor(x/width);
        var row = Math.floor(y/height);
        if(row >= 0 && row < model.rows && col >= 0 && col < model.cols &&
            model.board[row][col].visited != true){
                //figure out a way to keep track of what is next
                if(ff.nextStack.length>0){
                    var next = ff.nextStack.pop();
                    while(next.row < 0 || next.row >= model.rows ||
                        next.col < 0 || next.col >= model.cols ||
                        model.board[next.row][next.col] == null ||
                        model.board[next.row][next.col].visited == true){
                        next = ff.nextStack.pop();
                    }
                    if (next.row == row && next.col == col) {
                        ff.nextStack.push(next);
                        ff.next();
                        if(checkFull()){
                            ex.showFeedback("Done! Way to go!");
                        }

                    } else {
                        ex.showFeedback("Incorrect! Pay close attention\
                                        to the order of events!")
                        ff.nextStack.push(next);
                    }
                }
        }
        drawAll();

    });

    



};

