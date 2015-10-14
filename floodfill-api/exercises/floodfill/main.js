var main = function(ex) {
    window.exdata = ex.data;

    var model = {};
    var initModel = function() {
        if (typeof ex.data.model != 'undefined') {
            model = ex.data.model;
        } else {
            /* Initialize our model fields */
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
                                direction: null
                            });
                        }
                    }
                    board.push(row);
                }
                return board;
            };
            model.board = initBoard(model.rows, model.cols);
            ex.data.model = model;
        }
    };

    initModel();

   
};

