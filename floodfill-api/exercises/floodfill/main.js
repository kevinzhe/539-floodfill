var main = function(ex) {
    window.ex = ex;

    var UP;
    var DOWN;
    var LEFT;
    var RIGHT;
    var OFF_BOARD;
    var FILLED;

    /* Initialize our model fields */
    var model = {};
    var initModel = function() {
        if (typeof ex.data.model !== 'undefined') {
            model = ex.data.model;
        } else {
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
                                depth: null,
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
            /* Directions */
            model.UP = 'u';
            model.DOWN = 'd';
            model.RIGHT = 'r';
            model.LEFT = 'l';
            UP = model.UP;
            DOWN = model.DOWN;
            RIGHT = model.RIGHT;
            LEFT = model.LEFT;
            model.dirOrder = [UP, RIGHT, DOWN, LEFT];
            /* Return statuses */
            model.OFF_BOARD = 'ob';
            model.FILLED = 'f';
            OFF_BOARD = model.OFF_BOARD;
            FILLED = model.FILLED;
            /* Save the state */
            ex.data.model = model;
        }
    };
    initModel();
    
    /* The floodfill algorithm */

    var ff = {
        nextStack: [],
        prevStack: [],
        init: function(row, col) {
            ff.nextStack.push(model.board[row][col]);
        },
        next: function() {
            var cur = ff.nextStack.pop();
            var row = cur.row;
            var col = cur.col;
            if (row < 0 || row >= model.cols || col < 0 || col > model.cols) {
                return OFF_BOARD;
            }
            if (model.board[row][col].visited) {
                return FILLED;
            }
            for (var i = 0; i < model.dirOrder.length; i++) {
                var dir = model.dirOrder[i];
                var next;
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
                ff.nextStack.push(next);
            }
            cur.visited = true;
            ff.prevStack.push(cur);
        },
    };

    var drawArrow = function(dir, startx, starty, length){
        switch(dir){
            case UP:
                end = (startx, starty-length);
                break;
            case DOWN:
                end = (startx, starty+length);
                break;
            case LEFT:
                end = (startx-length, starty);
                break;
            case RIGHT:
                end = (startx+length, starty);
                break;
            default:
                break;

        ex.graphics.ctx.fillStyle = "black";
        ex.graphics.ctx.moveTo(startx, starty);
        ex.graphics.ctx.lineTo(end);
        ex.graphics.ctx.stroke();

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
                    ex.graphics.ctx.fillStyle = "green";
                    if (cell.visited) {
                        ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height); 
                        drawArrow(cell.direction, col*width, row*width, width)
                    } else {
                    ex.graphics.ctx.fillRect(xpos + margin,
                                            ypos + margin,
                                            width,
                                            height);
                    };
                };
            };
        };
    };
    model.board[2][3].visited = true;
    model.board[2][3].direction = UP;
    drawGrid();

    ff.init(); 
   
};

