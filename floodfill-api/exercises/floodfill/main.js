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
        model.dirOrder = [UP, RIGHT, DOWN, LEFT];
        ex.data.model = model;
    };
    initModel();
    
    /* The floodfill object */
    var ff = {
        nextStack: [],
        prevStack: [],
        init: function(row, col) {
            ff.nextStack.push({ row: row, col: col });
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
                ff.nextStack.push(next);
            }
            return MOVED;
        },
    };

    window.printBoard = function() {
        for (var i = 0; i < model.rows; i++) {
            for (var j = 0; j < model.cols; j++) {
                if (model.board[i][j] !== null) {
                    console.log(model.board[i][j].visited);
                }
            }
        }
    }

    var drawArrow = function(start, end){
        ex.graphics.ctx.fillStyle = "black";
        ex.graphics.ctx.moveTo(start);
        ex.graphics.ctx.lineTo(end);
        ex.graphics.ctx.stroke();

    }

    var drawGrid = function(){
        var width = ex.width()/2;
        var height = ex.height()/2;
        var margin = 20
        for (var row = 0; row < model.rows; row++) {
            for (var col = 0; col < model.cols; col++) {
                if (model.board[row][col] == null) {
                    ex.graphics.fillStyle = "black";
                    ex.graphics.ctx.fillRect(col*width/model.cols + margin,
                                               row*height/model.rows + margin,
                                                width/model.cols,
                                                height/model.rows);  
                } else {
                    ex.graphics.fillStyle = "green";
                    if (model.board[row][col].visited) {
                        ex.graphics.ctx.fillRect(col*width/model.cols + margin,
                                                row*height/model.rows + margin,
                                                width/model.cols,
                                                height/model.rows); 

                    } else {
                    ex.graphics.ctx.strokeRect(col*width/model.cols + margin,
                                               row*height/model.rows + margin,
                                                width/model.cols,
                                                height/model.rows);
                    };
                };

            };
        };
    };
    drawGrid();

    ff.init(2,2); 
   
};

