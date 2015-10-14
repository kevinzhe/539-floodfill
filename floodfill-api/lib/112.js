/**
 * @fileOverview The CMU Unlocked API.<br><br>
 *
 * Provides an HTML DOM interface using concepts similar to those taught in
 * Fundamentals of Programming and Computer Science (CMU 15-112).<br>
 *
 * The architecture is inspired by the p5 project, and implemented using
 * jQuery.<br><br>
 *
 * Each exercise folder that uses the API should have a config file named
 * "ex.data.json" which contains a <code>meta</code> field,
 * specifying metadata such as authorship, title, description, id, and dependencies.
 * See the documentation on {@link ex.data} for more information. Each exercise should
 * also contain a file named "main.js". Inside "main.js" there should exist a function
 * <code>function main(ex)</code>.
 * The API can be used inside that function.
 * <br><br>
 *
 * The API provides DOM creation methods, such as <code>ex.createButton</code>,
 * that return instances of <code>Element112</code>. This is an object that
 * contains standard methods such as <code>.style()</code>, <code>.hide()</code>
 * , etc. Each method returns the calling object, so the methods are chainable.
 * <br><br>
 * Element112's get default styling, if not otherwise specified. These styles
 * are contained in <code>ex.defaults</code>.<br><br>
 *
 * The API also provides a default canvas in the <code>ex.graphics</code>
 * module. <code>ex.graphics.ctx</code> is a initialized to a default 2d
 * rendering context. <br><br>
 *
 * The field <code>ex.data.meta.mode</code> contains the string "practice",
 * "quiz-immediate" or "quiz-delay". This specifies the mode of the exercise.
 * <br><br>
 *
 * When an exercise is unloaded and then loaded, all basic types inside
 * <code>ex.data</code> are saved. Basic types include objects,lists, strings, etc.
 * Exercise creators should use ex.data to save the state of an exercise, meaning if
 * the exercise is unloaded and the reloaded, it should be in the same state.
 * <br><br>
 * Exercise instructions are made in a file instr.html. This file should be created by
 * the exercise developer. Anything in instr.html will be loaded into the instructions
 * modal.  <br><br>
 *
 *
 *
 *
 * The kitchen sink is a great place to start!
 * @author  <a href="mailto:edryer@andrew.cmu.edu">Edward Dryer</a>
 * @author  <a href="mailto:richardz@andrew.cmu.edu">Richard Zhao</a>
 * @version 0.3
 */

"use strict";

/**
 * Wraps multiple exercises into a collection.
 * Finds exercises using the "exercises" field provided in collection.data.json.
 * Exercises are automatically added to the dropdown menu at the top of the page.
 * This object handles all loading and unloading for exercises.
 * The mode of the exercise (specificied in collection.data.json) is handed
 * to an individual exercise through ex.data.meta.mode as "quiz-immediate" or
 * "quiz-delay" or "practice".
 * @returns {undefined}
 * @private
 */
(function buildExerciseWrapper() {

    /**
     * Object that contains the current exercise and all other exercises.
     * This gets passed into define112Exercise.
     * @type {object}
     */
    var wrapper = {};

    /**
     * Represents a single exercise.
     * @param {object} data An object parsed from the list of exercises in
     * collection.data.json.
     * @class
     */
    function exercise(collectionData,exData) {
        /**
         * Name of the exercise. Displayed in the dropdown menu.
         * @type {string}
         */
        this.menuDisplayName = exData.meta.menuDisplayName;
        /**
         * Path to the exercise relative to the folder containing
         * collection.data.json
         * @type {string}
         */
        this.path = collectionData.path + "/";
        /**
         * Name of the main javascript file to be loaded for the exercise.
         * Usually main.js
         * @type {string}
         */
        this.mainFile = exData.meta.mainFile;
        /**
         * Name of the instructions file to be loaded for the exercise..
         * Usually instr.html
         * @type {string}
         */
        this.instrFile = exData.meta.instrFile;
        /**
         * Name of the constructor for the exercise. Usually main()
         * @type {string}
         */
        this.constructorName = exData.meta.constructorName;
        /**
         * ex object created in define112Exercise
         * @type {object | null}
         */
        this.ex = null;
        /**
         * serialized copy of ex.data which is used to store state.
         * @type {string | null}
         */
        this.state = null;
        /**
         * Called to close an exercise. Removes DOM elements, variables, and
         * saves the ex.data object as state.
         * @type {function}
         * @returns {undefined}
         */
        this.close = function () {
            if (wrapper.currentExercise.ex.unloadFunction) {
                wrapper.currentExercise.ex.unloadFunction();
            }
            var data = wrapper.currentExercise.ex.data;
            data.notes = $(".pencil-area").val();
            var state = JSON.stringify(data);
            wrapper.currentExercise.state = state;
            $(".exercise-outer-container").remove();
            $(".modal-feedback").remove();
            $(".pencil-div").remove();
            $(window).off();
            for (var i = 0; i < wrapper._timerIDS.length; i++) {
                var id = wrapper._timerIDS[i];
                wrapper.currentExercise.ex.stopTimer(id);
            }
        }

        /**
         * Called to open an exercise. If a state exists, ex.data will be set
         * to it in define112Exercise()
         * @type {function}
         * @returns {undefined}
         */
        this.open = function () {
            //path to main javascript file
            var source = this.path + this.mainFile;
            //call back after main javascript file is loaded
            var loaded = function () {
                var constr = window[wrapper.currentExercise.constructorName];
                wrapper.currentExercise.ex = define112Exercise(constr,wrapper);
            };

            var args = [source,loaded];

            $.getScript.apply(null,args).fail(
            function(jqXHR, status, error) {
                throw new Error(
                    "Script load of '" + source + "' failed with " +
                    "status: " + status + ". \nDetails: " + error);
            });
        }
    }

    /**
     * Given an index, creates a function that loads the exercise at that index.
     * Called when a drop down item is clicked.
     * @param {number} i loop index
     * @type {function}
     * @returns {function}
     */
    function buildLiClickFunction(i) {
        return function () {
            wrapper.currentExercise.close();
            wrapper.currentExercise = wrapper.exercises[i];
            wrapper.exercises[i].open();
        }
    }

     /**
     * Given an index, creates a function that creates an exercise wrapper object.
     * @param {object} collectionJSON parsed collection.data.json
     * @param {number} i loop index
     * @type {function}
     * @returns {function}
     */
     function buildExerciseWrap(collectionJSON,i) {
        return function (exerciseJSON) {
            //get the exercise object with path variable inside
            var exer = collectionJSON.meta.exercises[i];

            //make a wrapper exercise object
            wrapper.exercises.push(new exercise(exer,exerciseJSON));

            //if we are at the last exercise set the drop down
            if (i == collectionJSON.meta.exercises.length - 1) setDropdown();
            //if we are at the first exercise load it
            if (i == 0) {
                wrapper.currentExercise = wrapper.exercises[0];
                wrapper.currentExercise.open();
            }
        }
     }

    /**
     * Uses display names to set fields of the dropdown menu.
     * @type {function}
     * @returns {undefined}
     */
    function setDropdown() {
        for (var i = 0; i < wrapper.exercises.length; i++) {
            var name = wrapper.exercises[i].menuDisplayName;
            var liHTML = "<li><a href='#''>" + name + "</a></li>";
            var li = $(liHTML).click(buildLiClickFunction(i));
            $("#exercise-dropdown").append(li);
        }
    }

    /**
     * Loads collection.data.json into a list of exercises.
     * Sets the current exercise.
     * Stores the list and current exercise in the wrapper object
     * @type {function}
     * @returns {undefined}
     */
    function loadExercises() {
        //load the collection config file
        $.getJSON("../collection.data.json")
            .fail(function(jqXHR, status, error) {
                throw new Error("JSON load failed with status " + status + "." +
                    "\nDetails: " + error);
            }).done(function (collectionJSON) {
                //it loaded!

                //set the wrapper mode and make a list of exercises
                wrapper.exercises = [];
                wrapper.mode = collectionJSON.meta.mode;
                wrapper.collectionID = collectionJSON.meta.id;

                //load each exercise into the list
                for (var i = 0; i < collectionJSON.meta.exercises.length; i++) {
                    var exer = collectionJSON.meta.exercises[i];
                    $.getJSON(exer.path + "/" + "ex.data.json", buildExerciseWrap(collectionJSON,i)).fail(function(jqXHR, status, error) {
                throw new Error("JSON load failed with status " + status + "." +
                    "\nDetails: " + error);
            });
                }
            });
    }

    loadExercises();
})();



/**
 * Initialization function.
 * Users should pass a single function (which constructs an exercise) that takes
 * a single argument, `ex`, the API object.
 *
 * When setup is complete, the user's function is applied with a single
 * argument, `ex`, the API object. `ex` contains a number of useful namespaces:
 * <ul>
 *     <li><code>ex.data</code>
 *         : The contents of ex.data.json are initialized in here.
 *     </li>
 *     <li><code>ex.graphics</code>
 *         : Contains graphics utilities, such as .getContext().
 *     </li>
 * </ul>
 *
 * @example
 * // inside exercise.js (a user side file)
 *
 * // ex is the API object
 * function main(ex) {
 *     var myButton = ex.createButton(20, 20, "Click me!",
 *                                    { transition: "fade" });
 * }
 *
 * @param  {function} exerciseConstructor A function that initializes an
 *                                        exercise. Take in the exercise
 *                                        constructor built by the user, and the
 *                                        wrapper object built in the API.
 * @param {object} wrapper that holds the exercise. See buildExerciseWrapper().
 * @return {object} ex
 * @private
 */
function define112Exercise(exerciseConstructor,wrapper) {

    /**
     * Base namespace for the CMU Unlocked API.
     * @type {Object}
     * @namespace
     * @public
     */
    var ex = ex || {};


    /**
     * If true, assertion errors will be thrown.
     * @type {Boolean}
     * @private
     */
    var DEBUG = true;

    /**
     * Placeholder that gets set later by loadExDataJSON. Uniquely identifies
     * the exercise by concatenating the given ID in the conf file with
     * system time encoded in base 64.
     * @type {String}
     * @private
     */
    var UNIQUE_ID = undefined;


    ////////////////////////////////////////////////////////////////////////////
    //
    // Setup Procedure
    // ---------------
    //
    // The `setup` function starts this process.
    //
    // 1. Define ex.data
    // 2. loadExDataJSON: loads the ex.data.json file.
    // 3. loadJavascriptDependencies: loads JSON and JS dependencies listed in
    //      the ex.data.json file under the field `ex.data.meta.requires.js`.
    // 4. setupContainers: creates div for exercise to live in.
    // 5. definePublicAPI: initializes the API object that gets passed back
    //      to the user. Depends on successful execution of previous steps.
    //
    ////////////////////////////////////////////////////////////////////////////


    /**
     * This object gets filled with all the fields from ex.data.json. An example
     * file:
     * <pre><code>
     * {
     *     "meta": {
     *         "author": "Student",
     *         "email": "student@andrew.cmu.edu",
     *
     *         "title": "Example Exercise",
     *         "description": "An example exercise.",
     *         "id": "example-id",
     *
     *         "language": "python3",
     *         "difficulty": "medium",
     *         "mainFile": "main.js",
     *         "instrFile": "instr.html",
     *         "constructorName": "main",
     *         "menuDisplayName": "Creating Buttons",
     *
     *         "requires": {
     *             "js": ["js/helper.js"]
     *         }
     *     },
     *
     *     "colors": {
     *         "red": "#cd0a0f",
     *         "green": "31de21",
     *     }
     * }
     * </code></pre>
     * The above would be loaded such that ex.data.meta is the same object
     * as the one in ex.data.
     *
     * @type {Object}
     * @public
     */
    ex.data = {};

    /**
     * Object containing all chrome elements:
     * <ul>
     *  <li>ex.chromeElements.undoButton</li>
     *  <li>ex.chromeElements.redoButton</li>
     *  <li>ex.chromeElements.resetButton</li>
     *  <li>ex.chromeElements.newButton</li>
     *  <li>ex.chromeElements.submitButton</li>
     *  <li>ex.chromeElements.displayCAButton</li>
     *  <li>ex.chromeElements.titleHeader</li>
     *  <li>ex.chromeElements.instrButton</li>
     *  <li>ex.chromeElements.feedbackButton</li>
     * </ul>
     * @type {object}
     */
    ex.chromeElements = {};


    /**
     * Loads the exercise's ex.data.json file. See {@link ex.data}.
     * @param {Function} success Callback after data is loaded.
     * @return {undefined}
     * @private
     */
    function loadExDataJSON(success) {
        $.getJSON(wrapper.currentExercise.path + "ex.data.json")
            .fail(function(jqXHR, status, error) {
                throw new Error("JSON load failed with status " + status + "." +
                    "\nDetails: " + error);
            })
            .done(function(data) {
                // Assign everything in ex.data.json to ex.data
                for (var prop in data) {
                    ex.data[prop] = data[prop];
                }

                //load state
                if (wrapper.currentExercise.state) {
                    ex.data = JSON.parse(wrapper.currentExercise.state);
                }

                // The given exercise id in ex.data.json
                var confID = ex.data.meta.id;

                // Get system time and encode to b64 using .btoa()
                var sysTime = Date.now().toString();
                var b64 = window.btoa(sysTime.toString());

                // .replace uses the regex /=/g to replace '=' (g)lobaly
                UNIQUE_ID = confID + "-" + b64.replace(/=/g, "_");

                loadJavascriptDependencies(ex.data.meta, success);
            });
    };


    /**
     * Uses the default meta field in an ex.data.json file to load Javascript.
     * Looks at the field meta.requires.js.
     * @param  {Object} meta The `meta` field in ex.data.
     * @param {Function} success Callback after dependencies are loaded.
     * @return {undefined}
     * @private
     */
    function loadJavascriptDependencies(meta, success) {
        // A list of paths to .js files
        var javascriptFiles = meta.requires.js || [];
        var len = javascriptFiles.length;

        if (len == 0) success.apply(null);

        for (var i = 0; i < len; i++) {
            var filename = javascriptFiles[i];
            // Check that the file is .js
            if (filename.slice(-3) !== ".js") {
                throw new Error(
                    "files: '" + filename + "' in ex.data.meta.requires.js" +
                    "is not a valid Javscript file.");
            }

            var args = [wrapper.currentExercise.path + filename];
            // Pass in the callback for the last .js file loaded
            if (i === len - 1)
                args.push(success);
            $.getScript.apply(null, args)
                .fail(function(jqXHR, status, error) {
                    throw new Error(
                        "Script load of '" + filename + "' failed with " +
                        "status: " + status + ". \nDetails: " + error);
                });
        }
    };


    /**
     * Some constants for setting up the screen.
     * @private
     * @type {Object}
     */
    var _display = {

        /**
         * Width to height screen ratio.
         * @type {Number}
         */
        ratio: 4 / 3,

        /**
         * Pixel margin of the container.
         * @type {Number}
         */
        margin: 5,

        /**
         * Header Size
         * @type {Number}
         */
        header:50,


        /**
         * Cutoff width in pixels for the exercise container.
         * @type {Number}
         */
        minWidth: 640,

        /**
         * Cutoff height in pixels for the exercise container.
         * @type {Number}
         */
        minHeight: 480,

        /**
         * Viewable width of the window. <code>window.innerWidth</code> is
         * supported by all browsers, except some older versions of IE. jQuery
         * handles IE if innerWidth fails.
         * @return {Number} The width of the window port.
         */
        getWindowWidth: function() {
            return parseInt(window.innerWidth || $(window).width(), 10);
        },

        /**
         * Viewable height of the window. See {@link getWindowWidth}.
         * @return {Number} The height of the window port.
         */
        getWindowHeight: function() {
            return parseInt(window.innerHeight || $(window).height(), 10);
        },
    };

    /**
     * Sets up an outer container (for the entire exercise) and the inner
     * container (which content creators can access). Calls setupCanvas at the
     * end.
     * @private
     * @returns {undefined}
     */
    function setupContainersAndCanvas() {
        // Container ID, used to identify outer divs
        var exID = UNIQUE_ID;

        // Get the window width without margin and header
        var width = _display.getWindowWidth() - 2 * _display.margin;
        var height = (_display.getWindowHeight() - 2 * _display.margin
                      - _display.header);

        // Set the outer container width and height
        if (width / _display.ratio > height) {
            _display.height = height;
            _display.width = _display.ratio * height;
        } else {
            _display.width = width;
            _display.height = width / _display.ratio;
        }

        // Check if screen size is supported
        if (_display.width < _display.minWidth)
            raiseUnsupportedScreenSizeError();

        // Add the outside container
        // Use innerWidth & innerHeight for consistent sizing between browsers.
        var $container = $("<div></div>", {
            "class": "exercise-outer-container",
        }).innerWidth(_display.width)
          .innerHeight(_display.height)
          .appendTo($("body"));

        // Add the inside container
        $("<div></div>", {
            "class": "exercise-inner-container",
            id: exID,
            style: "width: 100%; height: 100%;",
        }).appendTo($container);

        setupCanvas();
    };


    /**
     * Creates a canvas element.
     * Assigns an ID of the form "UNIQUE_ID-canvas"
     * The `ex.graphics` namespace is defined in {@link definePublicAPI}.
     * TODO:
     *     - Canvas is a bit pixelated on high dpi screens (i.e. MBP Retina)
     *     - see http://www.html5rocks.com/en/tutorials/canvas/hidpi/
     * @return {undefined}
     */
    function setupCanvas() {
        var exID = UNIQUE_ID;
        var canvasID = exID + "-canvas";
        var width = $("#" + exID).width();
        var height = $("#" + exID).height();

        var $canvas = $("<canvas></canvas>", {
            id: canvasID,
        }).attr("width", width)
          .attr("height", height)
          .appendTo($("#" + exID));
    }

    /**
     * Sets up preexisting buttons for an exercise.
     * Returns all of the buttons to the individual exercise
     * in ex.chromeElements.
     * @private
     */
    function setupChrome() {

        /**
         * Holds information about external buttons we are setting up.
         * @type {object}
         */
        var settings = {
        margin: 5,
        bottomY: $(".exercise-inner-container").outerHeight() + 3,
        end:$(".exercise-inner-container").outerWidth(),
        color: "lightBlue",
        size: "small"
        };

        /**
         * Builds the bottom row of buttons:
         * Undo, Redo, Reset, New, Display Correct Answer, Submit
         * @type {function}
         * @private
         */
        (function buildBottomRow() {

            //Undo Button
            ex.chromeElements.undoButton = ex.createButton(0,settings.bottomY,"Undo",{
                size: settings.size,
                color:settings.color,
                selectable: true,
                keybinding: true
            });

            //Redo Button
            var x = settings.margin + ex.chromeElements.undoButton.outerWidth();
            ex.chromeElements.redoButton = ex.createButton(x,settings.bottomY,"Redo",{
                size: settings.size,
                color:settings.color,
                selectable: true,
                keybinding: true
            });

            //Reset Button
            x = x + settings.margin + ex.chromeElements.redoButton.outerWidth();
            ex.chromeElements.resetButton = ex.createButton(x,settings.bottomY,"Reset",{
                size: settings.size,
                color:settings.color,
                selectable: true,
                keybinding: true
            });

            //New Button
            x = x + settings.margin + ex.chromeElements.resetButton.outerWidth();
            ex.chromeElements.newButton = ex.createButton(x,settings.bottomY,"New",{
                size: settings.size,
                color:settings.color,
                selectable: true,
                keybinding: true
            });

            //New Button Click
            ex.chromeElements.newButton.on("click",function () {
                if (wrapper.mode == "practice") {
                    wrapper.currentExercise.close();
                    wrapper.currentExercise.state = null;
                    wrapper.currentExercise.open();
                }
            });

            //New Button Initial Setup
            if (wrapper.mode == "quiz-immediate" || wrapper.mode == "quiz-delay") {
                ex.chromeElements.newButton.disable();
            }

            //Submit Button
            x = settings.end;
            ex.chromeElements.submitButton = ex.createButton(x,settings.bottomY,"Submit",{
                size: settings.size,
                color: "green",
                selectable: true,
                keybinding: false
            });
            //once we have the width of the button move it to the correct spot
            x = x - ex.chromeElements.submitButton.outerWidth();
            ex.chromeElements.submitButton.position(x,settings.bottomY);

            //Submit Button Click
            ex.chromeElements.submitButton.on("click", function () {
                if (wrapper.mode == "quiz-immediate" || wrapper.mode == "practice") {
                    ex.chromeElements.submitButton.disable();
                    ex.chromeElements.displayCAButton.enable();
                    ex.chromeElements.undoButton.disable();
                    ex.chromeElements.redoButton.disable();
                    ex.chromeElements.resetButton.disable();
                } else {
                    ex.alert("Submitted!",{color:"green"});
                }
            });

            //Display Correct Answer Button
            x = settings.end - ex.chromeElements.submitButton.outerWidth();
            ex.chromeElements.displayCAButton = ex.createButton(x,settings.bottomY,
                "Display Correct Answer",{
                size: settings.size,
                color: settings.color,
            });
            x = x - ex.chromeElements.displayCAButton.outerWidth() - settings.margin;
            ex.chromeElements.displayCAButton.position(x,settings.bottomY);
            ex.chromeElements.displayCAButton.disable();

            //Display Correct Answer Button Click
            ex.chromeElements.displayCAButton.on("click", function(event) {
                if (!(ex.chromeElements.displayCAButton.isDisabled())) {
                    if (ex.chromeElements.displayCAButton.text() == "Display Correct Answer") {
                        ex.chromeElements.CorrectAnswerNotcn.show();
                        ex.chromeElements.CorrectAnswerNotcn.text("Correct Answer");
                        ex.chromeElements.displayCAButton.text("Display Your Answer");
                    } else {
                        ex.chromeElements.CorrectAnswerNotcn.show();
                        ex.chromeElements.CorrectAnswerNotcn.text("Your Answer");
                        ex.chromeElements.displayCAButton.text("Display Correct Answer");
                    }
                }
            });

        })();

        /**
         * Builds the top row
         * Title, Display Correct Answer Notification, Instructions, Pencil,
         * and feedback.
         * @type {function}
         * @private
         */
         (function buildTopRow() {

            //Build Title
            var x = 0;
            var y = 0;
            ex.chromeElements.titleHeader = ex.createHeader(x,y,ex.data.meta.title,{
                size: "large",
                selectable: false
            });

            //Reposition Title
            var headerBox = ex.chromeElements.titleHeader.box({margin:false,padding:true,
                  border  : true,
            });
            y = y - headerBox.height - 4 * settings.margin;
            ex.chromeElements.titleHeader.position(x,y);

            //Correct Answer Notification
            x = 0;
            y = 0;
            ex.chromeElements.CorrectAnswerNotcn = ex.createParagraph(x,y,"Your Answer");
            var paraBox = ex.chromeElements.CorrectAnswerNotcn.box({margin:false,padding:true,
                  border  : true,
            });
            y = y - paraBox.height - settings.margin;
            ex.chromeElements.CorrectAnswerNotcn.position(x,y);
            ex.chromeElements.CorrectAnswerNotcn.hide();

            //Instructions button
            x = settings.end;
            y = 0;
            var instrHTML = '<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>'
            ex.chromeElements.instrButton = ex.createButton(x,settings.bottomY,instrHTML,{
                size: "small",
            });

            //Reposition Instructions Button
            x = x - ex.chromeElements.instrButton.outerWidth() - settings.margin + 3;
            y = y - ex.chromeElements.instrButton.outerHeight() - settings.margin;
            ex.chromeElements.instrButton.position(x,y);

            //Instructions Button Click
            ex.chromeElements.instrButton.on("click", function () {
                $.get(wrapper.currentExercise.path + wrapper.currentExercise.instrFile, function (instructions) {
                    if (modal.container.css("opacity") == 1.0 && modal.title.html() == "Feedback") {
                        modal.closeButton.trigger("click");
                    }
                    modal.body.html(instructions);
                    modal.title.html("Instructions");
                    modal.toggle();
                });
            });

            //Feedback Button
            var feedbackHTML = '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>'
            ex.chromeElements.feedbackButton = ex.createButton(x,settings.bottomY,feedbackHTML,{
                size: "small",
            });

            //Reposition Feedback Button
            x = x - ex.chromeElements.feedbackButton.outerWidth() -  2 * settings.margin + 3;
            ex.chromeElements.feedbackButton.position(x,y);

            //Feedback Button Click
            ex.chromeElements.feedbackButton.on("click", function () {
                if (modal.container.css("opacity") == 1.0 && modal.title.html() == "Instructions") {
                    modal.closeButton.trigger("click");
                }

                modal.body.html(ex.data.meta.feedback || " ");
                modal.title.html("Feedback");
                modal.toggle();
            });

            //Pencil Button
            var pencilHTML = '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>'
            ex.chromeElements.pencilButton = ex.createButton(x,settings.bottomY,pencilHTML,{
                size: "small",
            });

            //Reposition Pencil Button
            x = x - ex.chromeElements.pencilButton.outerWidth() -  2 * settings.margin + 3;
            ex.chromeElements.pencilButton.position(x,y);

            //Pencil Button Click
            ex.chromeElements.pencilButton.on("click", function () {
                pencil.toggle();
            });

            //View Source Button
            //Only shows up for kitchen sink
            if (wrapper.collectionID == "kitchen-sink") {
                var viewSourceButton = ex.createButton(x,y,"View Source",{
                    size: "small",
                    color: "blue"
                });
                viewSourceButton.on("click", function () {
                    //redirect to link
                    var link = wrapper.currentExercise.path + "view_code.html";
                    window.open(link,"_blank");
                });
                x = x - viewSourceButton.outerWidth() - settings.margin;
                viewSourceButton.position(x,y);
            }

            /**
             * Note: Not using 112Elements below here because they
             * don't give access to the underlying DOM or jQuery objects.
             */

            /**
             * General Modal
             * Used for feedback and instructions.
             */
            var modal = {};

            //Positioning
            modal.width = settings.end / 2;
            modal.left = 0;
            modal.top = y + 125;

            ///Outer Container
            modal.container = $("<div></div>");
            modal.container.addClass("modal-feedback");
            modal.container.width(modal.width);
            modal.container.css("opacity",0);
            modal.container.css("visibility","hidden");
            modal.container.css("position","absolute");
            modal.container.css("left",modal.left.toString() + "px");
            modal.container.css("top",modal.top.toString() + "px");

            //Toggle Visibility Function
            modal.toggle = function () {
                if (modal.container.css("opacity") == 0) {
                    modal.container.css("opacity",1.0);
                    modal.container.css("visibility","visible");
                } else {
                    modal.container.css("opacity",0);
                    modal.container.css("visibility","hidden");
                }
            };

            //Modal Header
            modal.header = $("<div></div>")
            modal.header.addClass("modal-feedback-header");

            //Modal Close Button
            modal.closeButton = $("<button></button>");
            modal.closeButton.addClass("close");
            modal.closeButton.attr("type","button");
            modal.closeButton.attr("aria-label","Close");
            modal.closeButton.on("click", modal.toggle);
            modal.closeButton.html("<span aria-hidden='true'>×</span>");

            //Modal Title
            modal.title = $("<h4></h4>");
            modal.title.addClass("modal-feedback-title");

            //Modal Body
            modal.body = $("<div></div>");
            modal.body.attr("id","modal-feedback-body");
            modal.body.addClass("modal-feedback-body");
            ex.chromeElements.feedbackBody = modal.body;

            //Put everything together
            modal.header.append(modal.closeButton);
            modal.header.append(modal.title);
            modal.container.append(modal.header);
            modal.container.append(modal.body);
            $("body").append(modal.container);
            modal.left = ($(".exercise-outer-container").outerWidth() - modal.width) / 2;
            modal.container.css("left",modal.left.toString() + "px");

            /**
             * Pencil
             */
            var pencil = {};

            //Pencil Container
            pencil.container = $("<div></div>");
            pencil.container.addClass("pencil-div");
            pencil.container.css("visibility","hidden");
            pencil.container.css("position","absolute");
            pencil.container.css("left","0px");
            pencil.container.css("top","100px");

            //Pencil Header
            pencil.header = $("<div></div>");
            pencil.header.addClass("pencil-header");

            //Pencil Toggle Function
            pencil.toggle = function () {
                if (pencil.container.css("visibility") == "hidden") {
                    pencil.container.css("visibility","visible");
                } else {
                    pencil.container.css("visibility","hidden");
                }
            };

            //Pencil Close Button
            pencil.closeButton = $("<button></button>");
            pencil.closeButton.addClass("pencil-close-button");
            pencil.closeButton.html("×");
            pencil.closeButton.on("click", pencil.toggle);

            //Pencil Title
            pencil.title = $("<h4></h4>");
            pencil.title.addClass("pencil-header-text");
            pencil.title.html("Notes");

            //Pencil Text Area
            pencil.textarea = $("<textarea></textarea>");
            pencil.textarea.addClass("pencil-area");
            if (ex.data.notes) pencil.textarea.val(ex.data.notes);
            pencil.textarea.on("keydown", function(event) {
                event.stopPropagation();
            });

            //Put it all togher
            pencil.header.append(pencil.closeButton);
            pencil.header.append(pencil.title);
            pencil.container.append(pencil.header);
            pencil.container.append(pencil.textarea);
            $("body").append(pencil.container);
            pencil.left = ($(".exercise-outer-container").outerWidth() - pencil.container.outerWidth()) / 2;
            pencil.container.css("left",pencil.left.toString() + "px");

            //Pencil Dragging
            pencil.dragInfo = {};

            pencil.dragInfo.mousedown = function(event) {
                var x = event.pageX;
                var y = event.pageY;

                pencil.dragInfo.lastX = x;
                pencil.dragInfo.lastY = y;

                $(window).on("mousemove",pencil.dragInfo.mousemove);
                $(window).on("mouseup",pencil.dragInfo.mouseup);
            };

            pencil.dragInfo.mousemove = function(event) {
                var x = event.pageX;
                var y = event.pageY;

                var xChange = x - pencil.dragInfo.lastX;
                var yChange = y - pencil.dragInfo.lastY;

                //update position
                var currentX = pencil.container.css("left");
                var currentY = pencil.container.css("top");
                currentX = parseInt(currentX.substring(0,currentX.indexOf("p")));
                currentY = parseInt(currentY.substring(0,currentY.indexOf("p")));
                var newX = currentX + xChange;
                var newY = currentY + yChange;
                pencil.container.css("left",newX.toString() + "px");
                pencil.container.css("top",newY.toString() + "px");

                pencil.dragInfo.lastX = x;
                pencil.dragInfo.lastY = y;
            };

            pencil.dragInfo.mouseup = function(event) {
                $(window).off("mousemove",pencil.dragInfo.mousemove);
                $(window).off("mouseup",pencil.dragInfo.mouseup)
            };

            pencil.container.on("mousedown",pencil.dragInfo.mousedown);

         })();
    }

    /**
     * Gets called if the screen fails to meet minimum requirements. Does not
     * redirect in DEBUG mode.
     *
     * todo:
     *     - redirect is not implemented yet
     * @return {undefined}
     */
    function raiseUnsupportedScreenSizeError() {
        var msg = "Your current screen size is unsupported. Please resize " +
            "your window and refresh.\n\n" +
            "Current size: " + _display.width.toString() + " x " +
            _display.height.toString() + "\n" +
            "Minimum requirements: " + _display.minWidth.toString() + " x " +
            _display.minHeight.toString();
        if (DEBUG) {
            msg += "\n\nIn DEBUG mode: redirect suppressed.";
            alert(msg);
        } else {
            // Perform redirect
        }
    }

    /**
     * Main setup tasks should go in the callback passed to loadExDataJSON.
     * Putting tasks in the callback ensures that ex.data.meta is defined when
     * the callback runs.
     * @return {undefined}
     */
    (function setup() {
        // Load ex.data.json, then set up visual containers and API
        loadExDataJSON(function() {
            setupContainersAndCanvas();
            definePublicAPI();
            //send the mode from the wrapper to the exercise
            ex.data.meta.mode = wrapper.mode;
        });

    })();


    /**
     * Performs all tasks related to generating the user-side API.
     * @return {undefined}
     * @private
     */
    function definePublicAPI() {

        /**
         * Alias to the exercise container.
         * @type {jQuery}
         * @private
         */
        var $_container = $("#" + UNIQUE_ID);


        /**
         * Holds references to the original DOM elements of Element112
         * instances. Each field has the same name as Element112._elementReferenceID.
         * @type {Object}
         * @private
         */
        var _elementReferences = {};

        /**
         * Holds all onTimer ids.
         * @type {Array}
         * @private
         */
        wrapper._timerIDS = [];


        /**
         * Default style options.
         * @type {Object}
         */
        ex.defaults = {

            button: {
                color: "white",
                size: "medium",
                selectable: true,
                keybinding: false,
            },

            code: {
                size: "medium",
                width: "auto",
                language: "python",
                selectable: false,
            },

            header: {
                size: "medium",
                fontStyle: "bold",
                selectable: false,
            },

            paragraph: {
                size: "medium",
                width: "400px",
                selectable: false,
                fontStyle: "regular",
            },

            inputText: {
                size: "medium",
                inputSize: 20,
            },

            textarea: {
                size: "medium",
                rows: 8,
                cols: 20,
                resize: true,
            },

            alert: {
                color: "yellow",
                transition: "alert-default",
            },

            languages: [
                "python", "java", "javascript", "js", "c", "c0", "c++"
            ],

            keybinding: {
                'Undo': ['z', 90],
                'Redo': ['x', 88],
                'Reset': ['r', 82],
                'New': ['n', 78],
                'Next': ['.', 190],
                'Prev': [',', 188],
            },

        };


        /**
         * Namespace that contains graphics related tools:
         *
         * `ex.graphics.ctx` is initialized to a 2d rendering context (HTML Canvas).
         *  ex.graphics.on() works the same as ex.on() but binds to the canvas.
         *  ex.graphics.off() works the same as ex.off() but binds to the canvas.
         *  ex.graphics.drawEllipse() draws an ellipse.
         * @example
         * var centerX = 0;
         * var centerY = 0;
         * var width = 100;
         * var height = 100;
         * ex.graphics.ctx.drawEllipse(ex.graphics.ctx,centerX,centerY,width,height);
         *
         */
        ex.graphics = {

            /**
             * Attaches an event handler to canvas.
             *
             * @example
             * // A named handler
             * function notify() {
             *     alert("Hello!");
             * }
             * ex.graphics.on("click", notify);
             *
             * @param  {String} event   A Javascript event type, such as
             *                          "click", or "keypress".
             * @param  {Function} handler The handler function.
             * @return {undefined}
             */
            on: function(event, handler) {
                assertArgsLength(arguments,2,2);
                assertTypes(arguments,["string","function"]);
                $("#" + UNIQUE_ID + "-canvas").on(event, handler);
            },

            /**
             * Detach an event listener from the canvas.
             * @param  {String} event   A Javascript event type in string form.
             * @param  {Function} [handler] A function that optionally specifies
             *                            a handler to remove.
             * @return {undefined}
             */
            off:  function(event, handler) {
                assertArgsLength(arguments,1,2);
                assertTypes(arguments,["string","function"]);
                $("#" + UNIQUE_ID + "-canvas").off(event, handler);
            },

            /**
             * Returns a rendering context for the canvas. A wrapper for the
             * standard HTML get context.
             * @see  https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
             * @param  {String} contextType       Context identifier. The
             *                                    context in ex.graphics.ctx is
             *                                    "2d".
             * @param  {Object} [contextAttributes] Optional attributes. See
             *                                      the link to HTML docs.
             * @return {RenderingContext}
             */
            getContext: function(contextType, contextAttributes) {
                return $canvas[0].getContext(contextType, contextAttributes);
            },

            /**
             * The default rendering context (2d). To use other contexts,
             * overwrite this field, or use any other variable.
             *
             * @example
             * // Create an alias for ctx (don't have to type ex.graphics.ctx)
             * var ctx = ex.graphics.ctx;
             * ctx.rect(20, 20, 150, 100)   // Draw a rectangle
             *
             * // Create a 3d rendering context
             * ctx = ex.graphics.getContext("webgl");
             * @type {RenderingContext}
             */

            ctx: $("#" + UNIQUE_ID + "-canvas")[0].getContext("2d"),

            /**
             * Draws an ellipse.
             * from http://www.williammalone.com/briefs/how-to-draw-ellipse-html5-canvas/
             * @example
             * var centerX = 0;
             * var centerY = 0;
             * var width = 100;
             * var height = 100;
             * ex.graphics.ctx.drawEllipse(ex.graphics.ctx,centerX,centerY,width,height);
             *
             * @param {object} ctx ex.graphics.ctx
             * @param {number} centerX
             * @param {number} centerY
             * @param {number} width
             * @param {number} height
             * @returns {undefined}
             */
            drawEllipse: function(ctx, centerX, centerY, width, height) {
                assertArgsLength(arguments,5,5);
                assertTypes(arguments,["object","number","number","number","number"]);
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - height/2); // A1
                ctx.bezierCurveTo(
                    centerX + width/2, centerY - height/2, // C1
                    centerX + width/2, centerY + height/2, // C2
                    centerX, centerY + height/2); // A2
                ctx.bezierCurveTo(
                    centerX - width/2, centerY + height/2, // C3
                    centerX - width/2, centerY - height/2, // C4
                    centerX, centerY - height/2); // A1
                ctx.fill();
                ctx.closePath();
            }

        };


        /**
         * Gets the exercise container width.
         * @return {Number} The width in pixels.
         */
        ex.width = function() {
            assertArgsLength(arguments, 0);

            return $_container.width();
        };


        /**
         * Gets the exercise container height.
         * @return {Number} The height in pixels.
         */
        ex.height = function() {
            assertArgsLength(arguments, 0);

            return $_container.height();
        };

        /**
         * Attaches a document level event handler.
         * @example
         * // Attach an alert triggered by the return key
         * ex.on("keypress", function(event) {
         *     if (event.which == 13) {
         *         alert("Return pressed.");
         *     }
         * });
         * @param  {String} event   A Javascript event type in string form.
         * @param  {Function} handler The handler function. Gets passed a
         *                            Javascript event object.
         * @return {undefined}
         */
        ex.on = function(event, handler) {
            assertArgsLength(arguments,2,2);
            assertTypes(arguments,["string","function"]);
            $(document).on(event, handler);
        };


        /**
         * Detach a document level event handler.
         * @param  {String} event   A Javascript event type in string form.
         * @param  {Function} [handler] A function that optionally specifies
         *                            a handler to remove.
         * @return {undefined}
         */
        ex.off = function(event, handler) {
            assertArgsLength(arguments,1,2);
            assertTypes(arguments,["string","function"]);
            $(document).off(event, handler);
        };


        /**
         * Manually trigger any events bound to the document.
         * @param  {String} event   [description]
         * @return {undefined}
         */
        ex.trigger = function(event) {
            assertArgsLength(arguments,1,1);
            assertTypes(arguments,["string"]);
            $(document).trigger(event);
        };

        /**
         * Called when the exercise unloads.
         * Only one handler may be bound.
         * @param {function}
         * @returns {undefined}
         */
        ex.unload = function(handler) {
            ex.unloadFunction = handler;
        };



        /**
         * Creates an window timer. Pass in any additional arguments to be
         * passed to the handler.
         *
         * @example
         * // Greet someone every 100 milliseconds
         * function greet(name) {
         *     console.log(name);
         * }
         * var timerID = ex.onTimer(100, greet, "Fred");
         *
         * // Stop the timer
         * ex.stopTimer(timerID);
         * @param  {Number} delay   The delay, in milliseconds.
         * @param  {Function} handler A function that is called every cycle.
         * @return {Number}         An unique identifier that can be passed
         *                             to .stopTimer().
         * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowTimers/setInterval
         */
        ex.onTimer = function(delay, handler) {
            assertArgsLength(arguments,2,2);
            assertTypes(arguments,["number","function"]);
            // Get any extra arguments
            var aArgs = Array.prototype.slice.call(arguments, 2);
            // Add them to a call list
            var newArgs = [handler, delay].concat(aArgs);
            var id = window.setInterval.apply(null, newArgs);
            wrapper._timerIDS.push(id);
            return id;
        };


        /**
         * Stops a timer using it's unique identifier.
         * @param  {Number} intervalID The ID returned by .onTimer().
         * @return {undefined}
         */
        ex.stopTimer = function(intervalID) {
            assertArgsLength(arguments,1,1);
            assertTypes(arguments,["number"]);
            window.clearInterval(intervalID);
        };


        /**
         * A base class DOM wrapper. To see the original DOM element, call
         * the .log() method.
         *
         * This class has a number of private properties and methods that should
         * not be exposed. _elt refers to the DOM object that the class wraps.
         * $_elt is a jQuery object that wraps _elt, and is used as a shorthand.
         *
         * Note that `_this` is an explicit reference to the class's scope
         * at construction. Every chainable method should return _this, and
         * there should be no use of the original `this` within methods.
         *
         * Event handlers must be proxied (using $.proxy(handler, _this)) so
         * references to `this` inside the handler refer to the Element112
         * instance, not the DOM object (which would be a significant breach).
         *
         * @class
         * @param {HTMLElement} _elt  A DOM element to wrap.
         * @param {string} _kind Internal string identifier, such as "button",
         *                       or "dropdown".
         */
        var Element112 = function(_elt, _kind) {
            assertArgsLength(arguments,2,2);
            assertTypes(arguments,["object","string"]);

            /**
             * Holds a jQuery object that refers to the DOM object passed in.
             * @type {jQuery}
             * @private
             */
            var $_elt = $(_elt);


            /**
             * A binding to the original execution scope.
             * @type {Object}
             * @private
             */
            var _this = this;


            /**
             * An object to keep track of the element's cumulative styles
             * @type {Object}
             * @private
             */
            var _style = {};


            /**
             * Unique identifier applied to all elements belonging to the same
             * exercise instance.
             * @type {String}
             */
            this._instanceID = UNIQUE_ID;


            /**
             * Unique identifier applied to individual elements.
             * @type {String}
             */
            this._elementReferenceID = (function() {
                var id = UNIQUE_ID + Date.now().toString();
                // Base 64 encoding
                var b64 = window.btoa(id);
                // String replace equals signs, only use last 10 digits
                return (b64.replace(/=/g, "_")).slice(-10);
            })();


            // Store a reference to _elt in a private object
            _elementReferences[this._elementReferenceID] = _elt;


            /**
             * Logs the DOM element to the console.
             * @public
             */
            this.log = function() {
                assertArgsLength(arguments,0,0);
                console.log(_elt)
            };


            /**
             * Sets custom stylesheet classes. In general, the style class
             * is a hyphen-joined string of the form "type-property-attribute".
             * Some classes, such as transitions, have the more general form
             * "property-attribute".
             * @param  {Object} [options] An object of style options.
             * @return {Object} If no arguments are provided, the current
             *                     object corresponding to the style classes
             *                     is returned. Else, Element112 is returned.
             */
            this.style = function(options) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return _style;

                for (var prop in options) {
                    if (options[prop] === undefined) continue;

                    var val = options[prop];

                    // Perform class additions based on the options property
                    switch (prop) {

                        case "width":
                            $_elt.width(val);
                            break;

                        case "height":
                            $_elt.height(val);
                            break;

                        case "fontStyle":
                            assert(
                                member(_kind, ["header", "paragraph"]),
                                "Invalid option 'fontStyle'");
                            $_elt.css("font-style", val);
                            break;

                        case "textAlign":
                            assert(
                                member(_kind, ["header", "paragraph"]),
                                "Invalid option 'fontStyle'");
                            $_elt.css("text-align", val);
                            break;

                        case "inputSize":
                            assert(_kind === "inputText");
                            $_elt.attr("size", parseInt(val, 10));
                            break;

                        case "rows":
                        case "cols":
                            assert(_kind === "textarea");
                            $_elt.attr(prop, val);
                            break;

                        case "resize":
                            assert(_kind === "textarea");
                            if (val === false) {
                                $_elt.addClass("textarea-noresize");
                            }
                            break;

                        case "language":
                            assert(
                                member(val, ex.defaults.languages),
                                "Invalid language.");

                            // Reset existing text
                            var textContent = $_elt[0].textContent;
                            $_elt.html(textContent);
                            $_elt.removeClass("hljs");
                            $_elt.removeClass(_style[prop]);

                            // Apply highlight
                            $_elt.addClass("hljs " + val);
                            $_elt.each(function(index, block) {
                                hljs.highlightBlock(block);
                            });
                            break;

                        // Transitions are a global style
                        case "transition":
                            removeClassBySubstring("transition", _elt);
                            $_elt.addClass(["transition", val]
                                                .join("-"));
                            break;

                        // So is selectablity
                        case "selectable":
                            if (val === false)
                                $_elt.addClass("non-selectable");
                            else
                                $_elt.removeClass("non-selectable");
                            break;

                        case "keybinding":
                            assert(_kind === "button",
                                "Keybindings are only supported for buttons.");

                            if (val === false) break;

                            // Get the current label of the button
                            var label = $_elt.html();

                            // An array, [displaySym, keyCode]
                            var keybind;

                            if (typeof val === 'boolean') {
                                if (label in ex.defaults.keybinding) {
                                    keybind = ex.defaults.keybinding[label];
                                } else {
                                    throw new Error('Unrecognized default key binding.');
                                }
                            } else {
                                keybind = options.keybinding;
                            }

                            if (keybind.length != 2)
                                throw new Error('Invalid [symbol, keyCode] ' +
                                                'pair length.');

                            // Use a darker color for white buttons
                            if (_style.color === "white" ||
                                _style.color === undefined) {
                                var innerStyle = "color: #111;";
                            } else {
                                var innerStyle = "color: #fff;";
                            }

                            var symbol = keybind[0];
                            var keyCode = keybind[1];
                            var inner = ('<sup ' + 'style="' + innerStyle + '" ' +
                                         'class="keybinding">' + symbol + '</sup>');

                            $_elt.addClass("keybinding");
                            $_elt.html(inner + label);

                            // Add a document level key listener
                            $(document).on("keydown", function(event) {
                                // Don't activate the keybinding if hidden
                                if ($_elt.css("visibility") == "hidden") return;

                                // For modifier keys (not including shift)
                                if (event.metaKey || event.ctrlKey || event.altKey) return;

                                // Prevents double clicking the button
                                if ((event.keyCode || event.charCode) == keyCode) {
                                    event.preventDefault();
                                    $_elt.trigger("click");
                                    //if (b._events.mousedown) b._events.mousedown();
                                }
                            });
                            break;

                        default:
                            var subString = [_kind, prop].join("-");
                            removeClassBySubstring(subString, _elt);
                            $_elt.addClass([_kind, prop, val]
                                                .join("-"));
                    }

                    // Update internal _style object
                    _style[prop] = val;
                }

                return _this;
            };


            // Automatically apply default style on construction
            this.style(ex.defaults[_kind]);


            /**
             * Disable the element. Implemented for:
             * <ul>
             *     <li>button</li>
             * </ul>
             * @return {Object} Returns the API object.
             * @public
             */
            this.disable = function() {
                assertArgsLength(arguments,0,0);

                switch (_kind) {
                    case "dropdown":
                        $_elt.children(".btn").prop("disabled",true);
                        break;
                    case "button":
                    case "inputText":

                    case "textarea":
                        $_elt.prop("disabled",true)
                        break;
                    default:
                        throw new TypeError("Type '" + _kind +
                            "' does not have method 'disable()'");
                        break;
                }

                return _this;
            };


            /**
             * Enable the element. Implemented for:
             * <ul>
             *     <li>button</li>
             * </ul>
             * @return {Object} Returns the API object.
             * @public
             */
            this.enable = function() {
                assertArgsLength(arguments,0,0);
                switch (_kind) {
                    case "dropdown":
                        $_elt.children(".btn").prop("disabled",false);
                        break;
                    case "button":
                    case "inputText":
                    case "textarea":
                        $_elt.prop("disabled",false)
                        break;
                    default:
                        throw new TypeError("Type '" + _kind +
                            "' does not have method 'enable()'");
                        break;
                }

                return _this;
            };


            /**
             * Returns the element's disabled state.
             * @return {Boolean}
             */
            this.isDisabled = function() {
                assertArgsLength(arguments,0,0);
                var attr = $_elt.prop("disabled");
                return attr === true;
            };


            /**
             * Hides the element. Opacity transitions work.
             * @param {Function} [callback] Optional callback function.
             * @return {Object}
             */
            this.hide = function(callback) {
                assertArgsLength(arguments,0,1);
                assertTypes(arguments,["function"]);
                // Set opacity to 0, wait for transitions to end
                // and then set visibility to hidden.
                // Remove event listeners immediately.
                // jQuery .one() executes once per event, so it wouldn't work.
                $_elt.css("opacity", "0").on(
                    "transitionend webkitTransitionEnd " +
                    " oTransitionEnd MSTransitionEnd", function() {
                        $_elt.css("visibility", "hidden");

                        // Trigger the callback with the right scope
                        if (callback) callback.apply(_this);

                        // Remove the event listeners
                        $_elt.off(
                            "transitionend webkitTransitionEnd " +
                            " oTransitionEnd MSTransitionEnd");
                    });

                // //sets visibility if a transition did not happen
                // if (!(_elt.classList.contains("transition"))){
                //     $_elt.css("visibility", "hidden");
                // }

                return _this;
            };


            /**
             * Shows the element. Opacity transitions work.
             * @param {Function} [callback] Optional function that gets called
             *                              after completion of transitions.
             * @return {Object}
             */
            this.show = function(callback) {
                assertArgsLength(arguments,0,1);
                assertTypes(arguments,["function"]);
                $_elt.css({
                    "visibility": "visible",
                    "opacity": "1",
                }).on(  // Add transition event listeners
                    "transitionend webkitTransitionEnd " +
                    " oTransitionEnd MSTransitionEnd", function() {
                        // Trigger the callback with the right scope
                        if (callback) callback.apply(_this);

                        // Remove the event listeners
                        $_elt.off(
                            "transitionend webkitTransitionEnd " +
                            " oTransitionEnd MSTransitionEnd");
                });

                // //sets visibility if a transition did not happen
                // if (!(_elt.classList.contains("transition"))){
                //     $_elt.css("visibility", "visible");
                // }

                return _this;
            };


            /**
             * Returns the visibility state of the element. If the element has
             * transitions and was recently hidden, this method does not return
             * true until the transition is complete.
             * @return {Boolean}
             */
            this.isVisible = function() {
                assertArgsLength(arguments,0,0);
                var attr = $_elt.css("visibility");
                return (attr === "visible" || attr === "");
            };



            /**
             * Replaces the current element's label text. If no argument is
             * supplied, the current innerHTML is returned.
             * Current implementation works for the following elements
             * <ul>
             *   <li>Header</li>
             *   <li>Paragraph</li>
             *   <li>Button</li>
             *   <li>Dropdown</li>
             *   <li>Code</li>
             * </ul>
             * @param {string} [content] The replacement content.
             * @returns {undefined}
             */
            this.text = function(content) {
                assertArgsLength(arguments,0,1);
                assertTypes(arguments,["string"]);
                if (arguments.length === 0) {
                    if (_kind == "inputText" || _kind == "textarea") return $_elt.val();
                    return $_elt.html();
                }

                switch (_kind) {
                    case "textarea":
                    case "inputText":
                        $_elt.val(content);
                    case "header":
                    case "paragraph":
                        $_elt.html(content);
                        break;

                    case "dropdown":
                        if (_elt.classList.contains("dropdown-toggle")) {
                            $_elt.html(content + " <span class='caret'></span>");
                        }
                        break;

                    case "button":
                        if (_elt.classList.contains("keybinding")) {
                            _elt.childNodes[1].data = content;
                        } else {
                            $_elt.html(content);
                        }
                        break;

                    case "code":
                        $_elt.html(content);
                        $_elt.each(function(index, block) {
                            hljs.highlightBlock(block);
                        });
                        break;

                    default:
                        throwUnsupported(".text()");
                        break;
                }

                return _this;
            };


            /**
             * Removes the element from the DOM tree.
             * @return {undefined}
             */
            this.remove = function() {
                assertArgsLength(arguments,0,0);
                $_elt.remove();
                _elementReferences[this._elementReferenceID] = undefined;
            };


            /**
             * Sets and gets user-selectability state for an element. Calling
             * `.selectable(false)` disables user selection such as copying to
             * the clipboard. If called without arguments, a boolean state
             * indicating selectability is returned.
             * @param  {Booelan} [bool] False disables selectability.
             * @return {(Boolean|Object)} A boolean state is returned if no
             *                              arguments are provided.
             */
            this.selectable = function(bool) {
                assertArgsLength(arguments,0,1);
                assertTypes(arguments,["boolean"]);
                if (arguments.length === 0) {
                    // Check for default value
                    if (_style["selectable"] === undefined)
                        _style["selectable"] = true;
                    return _style["selectable"];
                }

                // Add to internal _style
                _style["selectable"] = bool;
                if (bool) {
                    $_elt.removeClass("non-selectable");
                } else {
                    $_elt.addClass("non-selectable");
                }

                return _this;
            };


            /**
             * Repositions the element at (x, y) relative to the top left of
             * the exercise area, with the element anchored top left.
             * If no arguments are provided, it returns an object with fields
             * "x" and "y".
             * @param  {Number} [x] Pixel x position.
             * @param  {Number} [y] Pixel y position.
             * @return {(undefined|Object)}     If no arguments are provided,
             *                                    an object is returned with
             *                                    fields "x" and "y".
             */
            this.position = function(x, y) {
                assertArgsLength(arguments,0,2);
                assertTypes(arguments,["number","number"]);
                // Get exercise container offset
                var offset = $("#" + _this._instanceID).offset();

                // Get position
                if (arguments.length === 0) {
                    var position = $_elt.offset();
                    return {
                        x: position.left - offset.left,
                        y: position.top - offset.top,
                    };
                } else {    // Set position
                    $_elt.css({
                        position: "absolute",
                        left: (offset.left + x).toString() + "px",
                        top : (offset.top  + y).toString() + "px",
                    });
                    return _this;
                }
            };


            /**
             * A comprehensive box measurement method. Returns and object with
             * fields "left", "top", "width", and "height". By default, the
             * entire box (margin, border, and padding) are included. Pass in
             * options to modify this. (i.e. Options all default to true.)
             *
             * Excluding margin, border, and padding is like calling .width().
             * Excluding margin and border is like calling .innerWidth().
             * Excluding just margin is like calling .outerWidth().
             * Excluding nothing (default) is like calling .outerWidth(true).
             *
             * Note: It does not make sense to include margin without including
             * padding and border. See the CSS box model.
             * @example
             * // Include padding and border, but not margin.
             * var bbox = myElement.box({
             *     margin  : false,
             *     padding : true,          // these are
             *     border  : true,          // optional
             * });
             *
             * // bbox is now
             * {
             *     left   : 12,
             *     top    : 44,
             *     width  : 42,
             *     height : 32
             * }
             * @param  {object} [options] Object with three possible fields:
             *                            padding, border, and margin.
             * @return {Object} Object with 4 fields:
             *                         <ul>
             *                             <li>left</li>
             *                             <li>top</li>
             *                             <li>width</li>
             *                             <li>height</li>
             *                         </ul>
             */
            this.box = function(options) {
                assertArgsLength(arguments,0,1);
                assertTypes(arguments,["object"]);
                // Get all measurements
                var marginLeft   = parseInt($_elt.css("margin-left"), 10);
                var marginRight  = parseInt($_elt.css("margin-right"), 10);
                var marginTop    = parseInt($_elt.css("margin-top"), 10);
                var marginBottom = parseInt($_elt.css("margin-bottom"), 10);

                var borderWidth  = parseInt($_elt.css("border-width"), 10);

                var paddingLeft   = parseInt($_elt.css("padding-left"), 10);
                var paddingRight  = parseInt($_elt.css("padding-right"), 10);
                var paddingTop    = parseInt($_elt.css("padding-top"), 10);
                var paddingBottom = parseInt($_elt.css("padding-bottom"), 10);

                // initial values include margin, padding, and border
                var pos = _this.position();
                var left = pos.x;
                var top = pos.y;
                var width = _this.outerWidth(true);
                var height = _this.outerHeight(true);

                // Exclude margin
                if (options && !options["margin"]) {
                    left += marginLeft;
                    top += marginTop;
                    width -= marginLeft + marginRight;
                    height -= marginTop + marginBottom;
                }

                // Exclude border
                if (options && !options["border"]) {
                    left += borderWidth;
                    top += borderWidth;
                    width -= borderWidth * 2;
                    height -= borderWidth * 2;
                }

                // Exclude padding
                if (options && !options["padding"]) {
                    left += paddingLeft;
                    top += paddingTop;
                    width -= paddingLeft + paddingRight;
                    height -= paddingTop + paddingBottom;
                }

                return {
                    x: left,
                    y: top,
                    width: width,
                    height: height,
                };
            };


            /**
             * If called without arguments, returns the width of the element
             * as a number (without "px"). If called with arguments, sets the
             * width.
             * @param  {(Number|String)} val Either a number in pixels or a
             *                               measurement (like "20px").
             * @return {(Number|Object)}     Number is returned for get method.
             *                               Else, regular object returned.
             */
            this.width = function(val) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return $_elt.width();

                switch (this._kind) {
                    case "button":
                        throwUnsupported("Setting .width()");
                        break;
                    default:
                        $_elt.width(val);
                }
                return _this;
            };


            /**
             * If called without arguments, returns the height of the element
             * as a number (without "px"). If called with arguments, sets the
             * width.
             * @param  {(Number|String)} val Either a number in pixels or a
             *                               measurement (like "20px").
             * @return {(Number|Object)}     Number is returned for get method.
             *                               Else, regular object returned.
             */
            this.height = function(val) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return $_elt.height();

                switch (_kind) {
                    case "button":
                        throwUnsupported("Setting .height()");
                        break;
                    default:
                        $_elt.height(val);
                }
                return _this;
            };


            /**
             * Without arguments, returns the innerWidth of the element (i.e.
             * the width with left and right padding, but no margin or border).
             * Given an argument, it sets the innerWidth.
             * @param  {(Number|String)} val Either a number in pixels or a
             *                               measurement (like "20px").
             * @return {(Number|Object)}     Number is returned for get method.
             *                               Else, regular object returned.
             */
            this.innerWidth = function(val) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return $_elt.innerWidth();

                switch (_kind) {
                    case "button":
                        throwUnsupported("Setting .innerWidth()");
                        break;
                    default:
                        $_elt.innerWidth(val);
                }
                return _this;
            };


            /**
             * Without arguments, returns the innerHeight of the element (i.e.
             * the height with top and bottom padding, but no margin or border).
             * Given an argument, it sets the innerHeight.
             * @param  {(Number|String)} val Either a number in pixels or a
             *                               measurement (like "20px").
             * @return {(Number|Object)}     Number is returned for get method.
             *                               Else, regular object returned.
             */
            this.innerHeight = function(val) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return $_elt.innerHeight();

                switch (_kind) {
                    case "button":
                        throwUnsupported("Setting .innerHeight()");
                        break;
                    default:
                        $_elt.innerHeight(val);
                }
                return _this;
            };


            /**
             * Returns the outerWidth of the element (i.e. the width with left
             * and right padding, border, and optionally margin included.) Pass
             * in `true` to include the margin. If a number or string is passed
             * in, the outerWidth is set.
             * @param  {(Boolean|Number|String)} val A Boolean value of true
             *                                      includes margin. A Number
             *                                      is interpreted in pixels.
             * @return {(Number|Object)}
             */
            this.outerWidth = function(val) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return $_elt.outerWidth();
                if (typeof val === "boolean") return $_elt.outerWidth(val);

                switch (_kind) {
                    case "button":
                        throwUnsupported("Setting .outerWidth()");
                        break;
                    default:
                        $_elt.outerWidth(val);
                }
                return _this;
            };


            /**
             * Returns the outerHeight of the element (i.e. the height with top
             * and bottom padding, border, and optionally margin included.) Pass
             * in `true` to include the margin. If a number or string is passed
             * in, the outerHeight is set.
             * @param  {(Boolean|Number|String)} val A Boolean value of true
             *                                      includes margin. A Number
             *                                      is interpreted in pixels.
             * @return {(Number|Object)}
             */
            this.outerHeight = function(val) {
                assertArgsLength(arguments,0,1);
                if (arguments.length === 0) return $_elt.outerHeight();
                if (typeof val === "boolean") return $_elt.outerHeight(val);

                switch (_kind) {
                    case "button":
                        throwUnsupported("Setting .outerHeight()");
                        break;
                    default:
                        $_elt.outerHeight(val);
                }
                return _this;
            };


            /**
             * Attaches an event handler to the specified event type. The
             * handler can be anonymous or named.
             *
             * @example
             * // A named handler
             * function notify() {
             *     alert("Hello!");
             * }
             * myButton.on("click", notify);
             *
             * // An anonymous handler
             * myButton.on("click", function() {
             *     alert("What's up?");
             * });
             *
             * // References itself without using this.hide();
             * myButton.on("click", function() {
             *     myButton.hide();
             * });
             * @param  {String} event   A Javascript event type, such as
             *                          "click", or "keypress".
             * @param  {Function} handler The handler function.
             * @return {Object}         Element112
             */
            this.on = function(event, handler) {
                assertArgsLength(arguments,2,2);
                assertTypes(arguments,["string","function"]);
                $_elt.on(event, $.proxy(handler, _this));
                return _this;
            };


            /**
             * Removes an event handler. Calling .off() with an optional handler
             * name removes the specific handler. Calling .off() with no
             * arguments removes all event handlers from the element.
             * @param  {String} event   A Javascript event type, such as
             *                          "click" or "keypress".
             * @param  {function} [handler] Optionally specifies a handler
             *                              to remove.
             * @return {Object}         Element112
             */
            this.off = function(event, handler) {
                assertArgsLength(arguments,1,2);
                assertTypes(arguments,["string","function"]);
                $_elt.off(event, $.proxy(handler, _this));
                return _this;
            };


            /**
             * Trigger all handlers attached to the element's specified event.
             * @param  {String} event A String containing a Javascript event
             *                        type, such as "click".
             * @return {Object}       Element112.
             */
            this.trigger = function(event) {
                assertArgsLength(arguments,1,1);
                assertTypes(arguments,["string"]);
                $_elt.trigger(event);
                return _this;
            };

            /**
             * Triggers a click on a dropdown element at index i.
             * @param {number} index element index to trigger in the dropdown list (0 indexed)
             * @return {object}
             */
            this.triggerDropdown = function(index) {
                assertArgsLength(arguments,1,1);
                assertTypes(arguments,["number"]);
                switch (_kind) {
                    case "dropdown":
                        $(_elt.childNodes[1].childNodes[index]).trigger("click");
                        break;
                    default:
                        throwUnsupported("calling .triggerDropdown()");
                }
                return _this;
            }
        }

        /**
         * Creates a button element.
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} label   Display label of the button.
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>size: "medium"</li>
         *                              <li>color: "white"</li>
         *                              <li>selectable: true</li>
         *                              <li>keybinding: false</li>
         *                          </ul>
         * @return {Element112}
         */
        ex.createButton = function(x, y, label, options) {
            assertArgsLength(arguments,3,4);
            assertTypes(arguments,["number","number","string","object"]);
            var $button = $("<button></button>")
                            .addClass("button")
                            .html(label)
                            .appendTo($_container);
            var element = new Element112($button[0], "button");
            element.style(options);
            element.position(x, y);
            return element;
        };

        /**
         * Creates an image element.
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} src   Source of the image relative to main.js.
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>width: "200px"</li>
         *                              <li>height: "200px"</li>
         *                          </ul>
         * @return {Element112}
         */
        ex.createImage = function(x, y, src, options) {
            assertArgsLength(arguments,3,4);
            assertTypes(arguments,["number","number","string","object"]);
            var imgHTML = "<img src='" + wrapper.currentExercise.path +  src + "'/>"
            var $img = $(imgHTML).appendTo($_container);
            if (options == undefined) {
                options = {
                    width: "200px",
                    height: "200px"
                };
            }
            var element = new Element112($img[0], "img");
            element.style(options);
            element.position(x, y);
            return element;
        };


        /**
         * Creates a code element.
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} code    Source code to display.
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>language: "python"</li>
         *                              <li>width: "auto"</li>
         *                              <li>size: "medium"</li>
         *                              <li>selectable: false</li>
         *                          </ul>
         * @return {Element112}
         */
        ex.createCode = function(x, y, code, options) {
            assertArgsLength(arguments,3,4);
            assertTypes(arguments,["number","number","string","object"]);
            var $code = $("<pre>" + code + "</pre>")
                            .addClass("code")
                            .appendTo($_container);
            var element = new Element112($code[0], "code");
            element.style(options);
            element.position(x, y);
            return element;
        };


        /**
         * Creates a header element.
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} text    Text to display.
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>fontStyle: "bold"</li>
         *                              <li>size: "medium"</li>
         *                              <li>selectable: false</li>
         *                          </ul>
         * @return {Element112}
         */
        ex.createHeader = function(x, y, text, options) {
            assertArgsLength(arguments,3,4);
            assertTypes(arguments,["number","number","string","object"]);
            var $header = $("<h6>" + text + "</h6>")
                            .addClass("header")
                            .appendTo($_container);
            var element = new Element112($header[0], "header");
            element.style(options);
            element.position(x, y);
            return element;
        };


        /**
         * Creates a paragraph element.
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} text    Text to display.
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>fontStyle: "regular"</li>
         *                              <li>size: "medium"</li>
         *                              <li>width: "medium"</li>
         *                              <li>textAlign: "left"</li>
         *                              <li>selectable: false</li>
         *                          </ul>
         * @return {Element112}
         */
         ex.createParagraph = function(x, y, text, options) {
            assertArgsLength(arguments,3,4);
            assertTypes(arguments,["number","number","string","object"]);
            var $para = $("<p>" + text + "</p>")
                            .addClass("paragraph")
                            .appendTo($_container);
            var element = new Element112($para[0], "paragraph");
            element.style(options);
            element.position(x, y);
            return element;
        };


        /**
         * Creates an input box element. The inputSize option is the width
         * of the input box in characters (approximately). When the input box
         * is in focus, document key events are suppressed using
         * event.stopPropagation().
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} [placeholder]    Placeholder text
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>size: "medium"</li>
         *                              <li>inputSize: 20</li>
         *                          </ul>
         * @return {Element112}
         */
         ex.createInputText = function(x, y, placeholder, options) {
            assertArgsLength(arguments,2,4);
            assertTypes(arguments,["number","number","string","object"]);
            var $input = $("<input type='text'>")
                            .addClass("input")
                            .appendTo($_container);
            if (placeholder) {
                $input.attr("placeholder", placeholder);
            }

            // Prevent triggering document keybindings
            $input.on("keydown", function(event) {
                event.stopPropagation();
            });

            var element = new Element112($input[0], "inputText");
            element.style(options);
            element.position(x, y);
            return element;
        };


        /**
         * Creates an text area element. When a text area is in focus, document
         * key events are suppressed using event.stopPropagation().
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} [placeholder]    Placeholder text
         * @param  {Object} [options] Defaults:
         *                          <ul>
         *                              <li>size: "medium"</li>
         *                              <li>cols: 20</li>
         *                              <li>rows: 8</li>
         *                              <li>resize: true</li>
         *                          </ul>
         * @return {Element112}
         */
         ex.createTextArea = function(x, y, placeholder, options) {
            assertArgsLength(arguments,2,4);
            assertTypes(arguments,["number","number","string","object"]);
            var $textarea = $("<textarea type='text'>")
                            .addClass("input")
                            .appendTo($_container);
            if (placeholder) {
                $textarea.attr("placeholder", placeholder);
            }

            // Prevent triggering document keybindings
            $textarea.on("keydown", function(event) {
                event.stopPropagation();
            });

            var element = new Element112($textarea[0], "textarea");
            element.style(options);
            element.position(x, y);
            return element;
        };


        /**
         * Creates an alert popup that automatically fades.
         *
         * @param {string} message The message displayed.
         * @param {string} [options] Defaults:
         *      <ul>
         *        <li>color: "yellow"</li>
         *        <li>transition: "alert-default"</li>
         *        <li>stay: false</li>
         *        <li>green</li>
         *        <li>red</li>
         *        <li>yellow</li>
         *        <li>blue</li>
         *      </ul>
         * @return {Element112}
         */
        ex.alert = function(message, options) {
            assertArgsLength(arguments,1,2);
            assertTypes(arguments,["string","object"]);
            var width = ex.width() / 3;
            var left = ex.width() / 2 - width / 2;
            var top = ex.height() / 4;

            var $alert = $("<div></div>")
                            .addClass("alert")
                            .width(width);
            $alert.css({
                opacity: "1.0",
                visibility: "visible",
            });

            var $closeButton = $("<button class='close'></button>")
                                .attr("type", "button")
                                .attr("aria-label", "Close")
                                .html("<span aria-hidden='true'>×</span>");
            $closeButton.on("click", function() {
                $alert.remove();
            });

            // Add message, then put button at the beginning of div
            $alert.html(message);
            $alert.prepend($closeButton);
            $_container.append($alert);

            var element = new Element112($alert[0], "alert");
            element.style(options);
            element.position(left, top);

            if (!options || options.stay != true) {
                // Automatically remove after transition completes
                element.hide(function() {
                    this.remove();
                });
            }

            return element;
        };


        /**
         * A drop down list, where each list element is bindable to a function.
         * <code>options</code> should contain a field, <code>elements</code>
         * that is an object that maps list labels to functions they perform
         * when that element is clicked.
         *
         * @example
         * // Dropdown has the label "Functions"
         * // with three elements in its list: foo, bar, and baz.
         * // Clicking on foo or bar logs its name, while clicking on baz
         * // does nothing.
         * var drop = ex.createDropdown(10, 10, "Functions", {
         *     color: "orange",
         *     elements: {
         *         foo: function() { console.log("foo") },
         *         bar: function() { console.log("bar") },
         *         baz: undefined,
         *     }
         * });
         * @param  {Number} x       Pixel x position.
         * @param  {Number} y       Pixel y position.
         * @param  {String} label   Display label of the trigger.
         * @param  {Object} options Defaults:
         * <ul>
         *     <li>color: white</li>
         * </ul>
         * @return {Element112}
         */
        ex.createDropdown = function(x, y, title, options) {
            assertArgsLength(arguments,3,4);
            assertTypes(arguments,["number","number","string","object"]);
            var colors = {
                'dark-blue'  : 'btn-primary',
                'green'      : 'btn-success',
                'red'        : 'btn-danger',
                'orange'     : 'btn-warning',
                'light-blue' : 'btn-info',
                'white'       : 'btn-default',
            };

            // Create dropdown container
            var $dropdown = $("<div class='dropdown'></div>");

            // Button that opens the dropdown
            var $trigger = $("<button class='btn'></button>")
                                .addClass("dropdown-toggle")
                                .attr("data-toggle", "dropdown");

            // Assign trigger label
            var icon = " <span class='caret'></span>";
            $trigger.html(title + icon);

            var color = options["color"];
            if (color in colors) {
                $trigger.addClass(colors[color]);
            } else {
                $trigger.addClass("btn-default");
            }

            // Dropdown list
            var $list = $("<ul class='dropdown-menu'></ul>");
            var elements = options["elements"];

            // Returns an anonymous function to change the trigger label
            function labelChangeFn(newLabel) {
                return function() {
                    $trigger.html(newLabel + icon);
                };
            }

            for (var label in elements) {
                var $li = $("<li><a>" + label + "</a></li>");
                var handler = elements[label];
                assert(typeof handler === "function" || handler === undefined,
                    "createDropdown options.elements." + label + " expected " +
                    "'function' or undefined.");
                $li.on("click", handler);

                // Add label change
                $li.on("click", labelChangeFn(label));

                $list.append($li);
            }

            $dropdown.append($trigger);
            $dropdown.append($list).appendTo($_container);

            // Clear dropdown-specific options
            options["elements"] = undefined;
            options["color"] = undefined;

            var element = new Element112($dropdown[0], "dropdown");
            element.position(x, y);
            return element;
        };


        /**
         * This function takes a preexisting dropdown and replaces a
         * string identifier in another preexisting code area with the dropdown.
         * We recommend using values such as '_1', '_2', etc. as the unique identifier.
         * <b>The existing Code Area must contain the unique identifier in
         * a '&lt;span&gt;' element.<b>
         *
         * @example
         * // Create the code area with an identifier in a <span>
         * var myPythonCode =
         *     "def <span>_1</span>():\n" +
         *     "    print 'cat'";
         * var code = ex.createCode(10, 10, myPythonCode,
         *                          { language: "python" });
         *
         * var drop = ex.createDropdown(10, 10, "Functions", {
         *     color: "orange",
         *     elements: {
         *         foo: function() { console.log("foo") },
         *         bar: function() { console.log("bar") },
         *         baz: undefined,
         *     }
         * });
         * ex.insertDropdown(code, "_1", drop);
         *
         * @param {object} Code A Code element.
         * @param {string} identifier A unique string in Code to be replaced.
         * @param {object} Dropdown A Dropdown element.
         */
        ex.insertDropdown = function(Code, identifier, Dropdown) {
            assertArgsLength(arguments,3,3);
            assertTypes(arguments,["object","string","object"]);
            // Get the DOM elements from _elementReferences
            var $Code = $(_elementReferences[Code._elementReferenceID]);
            var $Dropdown = $(_elementReferences[Dropdown._elementReferenceID]);

            // Get the target span
            // jQuery has no way to use `:contains()` to select the innermost
            // matches... just using pure JS to do the span selection
            var spans = $Code[0].getElementsByTagName("span");
            var $targetSpan = undefined;
            for (var i = 0; i < spans.length; i++) {
                if (spans[i].innerHTML.indexOf(identifier) !== -1) {
                    $targetSpan = $(spans[i]);
                }
            }
            assert($targetSpan != [], "identifier not found.");

            // Set dropdown classes
            $Dropdown.find("button").addClass("dropdown-inline");
            $Dropdown.find("ul").addClass("dropdown-inline");

            // Remove absolute positioning
            $Dropdown.removeAttr("style");

            // Add dropdown to a new span
            var $span = $("<span></span>");
            $span.css({
                display: "inline-block",
                "vertical-align": "bottom",
            });
            $span.append($Dropdown);

            // Insert dropdown
            $span.insertBefore($targetSpan);

            // Remove old
            $targetSpan.remove();

            // Fix overflow
            $Code.css("overflow", "visible");
        };

        /**
         * Sets the text in the feedback modal and displays it.
         * Sets a variable ex.data.meta.feedback to the parameter feedback.
         * @param {string} feedback feedback string
         * @return {undefined}
         */
        ex.showFeedback = function(feedback) {
            assertArgsLength(arguments,1,1);
            assertTypes(arguments,["string"]);
            ex.data.meta.feedback = feedback;
            ex.chromeElements.feedbackButton.trigger("click");
            ex.chromeElements.feedbackBody.html(feedback);
        };

        setupChrome();
        // Make the final call to their exercise
        exerciseConstructor.apply({}, [ex]);

    }

    //////////////////////
    // Helper functions //
    //////////////////////


    /**
     * A basic assertion function
     * @param {boolean} condition A boolean expression.
     * @param {string} [message] The message displayed if failed.
     */
    function assert(condition, message) {
        if (DEBUG) {
            // If no message specified
            message = message || "";

            if (!(condition))
                throw new Error("Assertion Error: " + message);
        }
    };


    /**
     * A basic argument list length assertion. Throws a TypeError.
     * Use this before assertTypes.
     * @param {Array} args The standard arguments list from a function.
     * @param {number} min The minimum number of arguments. If max is not
     *                     passed then the function asserts strictly 'min'
     *                     number of arguments.
     * @param {number} [max] For variable argument lengths.
     * @private
     */
    function assertArgsLength (args, min, max) {
        if (!DEBUG) return;
        // No optional arguments
        if (!max) {
            if (args.length != min) throw new TypeError(
                    "takes exactly " + min.toString() + " arguments (" +
                    args.length.toString() + " given)");
        } else {
            if (args.length < min || args.length > max) throw new TypeError(
                    "takes " + min.toString() + " to " + max.toString() +
                    " arguments (" + args.length.toString() + " given)");
        }
    }


    /**
     * Asserts each parameter in an argument list to a corresponding list of
     * types.
     * @param {Array} params The standard arguments list from a function.
     * @param {Array} types Each type or array of types in this array
     *                      corresponds to legal types that can be taken.
     * @private
     */
    function assertTypes(params, types) {
        if (!DEBUG) return;
        var i = 0;
        var l = params.length;
        for ( ; i < l; i++) {
            if (typeof types[i] === "string") types[i] = [types[i]];
            if (!member((typeof params[i]), types[i])) {
                var expected = "'" + types[i][0] + "'",
                    actual = "'" + typeof params[i] + "'",
                    arg = "arg[" + i.toString() + "]";
                throw new TypeError(arg + " expected " + expected +
                                    ", received " + actual);
            }
        }
    };

    /* Throws a TypeError that specifies the deprecated method name, what it
     * should be replaced with, and an optional clarification method.
     *
     * @param {string} oldName The deprecated method name.
     * @param {string} newName The new method name.
     * @param {string} [opt_message] Any additional clarifications.
     * @private
     */
    function throwDeprecated(oldName, newName, opt_message) {
        var msg;
        if (!newName) {
            msg = oldName + " is deprecated. Use ex."
                + oldName + " instead.";
        } else {
            msg = oldName + " is deprecated. Use " + newName + " instead.";
            if (opt_message) {
                msg += " " + opt_message;
            }
        }
        throw new TypeError(msg);
    };


    /**
     * True if the object passed is a HTML DOM element.
     * @param {object} obj The object being tested.
     * @returns {boolean}
     * @private
     */
    function isDOMElement(obj) {
        return obj.nodeType && obj.nodeType === 1;
    };


    /**
     * True if the object passed is an API element.
     * @param {object} obj The object being tested.
     * @returns {boolean}
     */
    function isElement112(obj) {
        return obj.log && obj._instanceID === UNIQUE_ID;
    };


    /**
     * Utility function that checks object membership in an array.
     * @param {*} elem A target element.
     * @param {Array} list The list to be searched.
     * @returns {boolean}
     */
    function member(elem, list) {
        var found = false;
        for (var i = 0; i < list.length; i++) {
            if (list[i] == elem) found = true;
        }
        return found;
    };


    /**
     * Wrapper for unsupported errors. Automatically gets the element
     * _kind.
     * @param  {String} action      The unsupported action.
     * @return {undefined}
     * @private
     */
    function throwUnsupported(action) {
        var msg = action + " is unsupported for elements of type '" +
            _kind + "'.";
        throw new TypeError(msg);
    }

    /**
     * Helper function that removes classes based on a prefix.
     * @param  {String} subString A string to search each class with.
     * @param  {Object} element   A DOM element.
     * @return {undefined}
     * @private
     */
    function removeClassBySubstring(subString, element) {
        // Remove existing classes
        var i = 0;
        while (i < element.classList.length) {
            var eltClass = element.classList[i];
            if (eltClass.indexOf(subString) !== -1)
                element.classList.remove(eltClass);
            else
                i++;
        }
    }

    return ex;
}
