/**
 * Copyright (c) 2014 Famous Industries, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 *
 * @license MIT
 */

/**
 * GridLayout with sized modifier
 * ------------------------------
 * 
 * GridLayouts will respect their parents size.  When placed behind
 * a modifier with a set size, the layout will expand to that size
 * instead of filling the full window.
 *
 * In this example, we see a GridLayout behind a sized Modifier.
 */

define(function(require, exports, module) {
    //core
    var Engine     = require("famous/core/Engine");
    var Surface    = require("famous/core/Surface");
    var Modifier   = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");
    var EventHandler = require("famous/core/EventHandler");

    var GridLayout = require("famous/views/GridLayout");
    var Transitionable = require("famous/transitions/Transitionable");

    //modifiers
    var Draggable = require('famous/modifiers/Draggable');
    var StateModifier = require('famous/modifiers/StateModifier');

    //inputs
    var ScrollSync = require("famous/inputs/ScrollSync");
    var MouseSync = require("famous/inputs/MouseSync");

    //transitions
    var WallTransition = require('famous/transitions/WallTransition');
    Transitionable.registerMethod('wall', WallTransition);

    /**
    *
    * Toggle edit mode
    *
    **/

    var images = ['http://m1.behance.net/rendition/modules/117187517/hd/0db08a292bd13b7899317a2d74ce63d0.png',
    'http://m1.behance.net/rendition/modules/117187519/hd/fda8e9dfccdb318db8929df4dbeeb6db.jpg',
    'http://m1.behance.net/rendition/modules/117187523/hd/27374b88bb711f63adfa74c96a31931f.jpg',
    'http://m1.behance.net/rendition/modules/117187529/hd/7d0346d2d0df32462d256c2468938481.jpg',
    'http://m1.behance.net/rendition/modules/117187511/hd/30399755dc75494b79eca5b67c40992d.jpg',
    'http://m1.behance.net/rendition/modules/117187507/hd/a6188394c1c8e3760e9ca11591cd8601.jpg'];

    var editing = false;

    var editButtonModifier = new Modifier({
        origin: [1, 0],
        opacity: function() {
            if (editing) {
                return 0.5;
            }
            return 1;
        },
        size: [50, 40]
    });

    var editButton = new Surface({
        content: 'Edit',
        size: [undefined, undefined],
        properties: {
            background: 'black',
            color: 'white',
            textAlign: 'center',
            lineHeight: '40px'
        }
    });

    var editClickSync = new MouseSync();

    editButton.pipe(editClickSync);

    editClickSync.on('start', function(){
        editing = !editing;
        if (editing){
            Engine.unpipe(panMouseSync);
            Engine.pipe(selectMouseSync);
        } else {
            Engine.pipe(panMouseSync);
            Engine.unpipe(selectMouseSync);
        }
    });

    /**
    *
    * Grid and Select
    *
    **/

    var size = new Transitionable([0, 0]);
    var anchor = new Transitionable([0, 0]);

    var selectBox = new Surface({
        classes: ["grey-bg", "selectBox"]
    });

    var selectBoxSize = new Modifier({
        size: function(){
            var currentSize = size.get();
            if((currentSize[0] < 0 && currentSize[1] > 0) || (currentSize[0] > 0 && currentSize[1] < 0)){
                return [Math.abs(currentSize[1]), Math.abs(currentSize[0])];
            }
            return [Math.abs(currentSize[0]), Math.abs(currentSize[1])];
        }
    });

    var selectBoxAnchor = new Modifier({
        transform: function(){
            var currentPosition = anchor.get();
            return Transform.translate(currentPosition[0], currentPosition[1], 0);
        }
    });

    var selectBoxRotation = new Modifier({
        transform: function(){
            var currentSize = size.get();
            if(currentSize[0] < 0 && currentSize[1] < 0){
                return Transform.rotateZ(Math.PI);
            } 
            if(currentSize[0] < 0 && currentSize[1] > 0){
                return Transform.rotateZ(Math.PI / 2);
            }
            if(currentSize[0] > 0 && currentSize[1] < 0){
                return Transform.rotateZ(Math.PI * 3 / 2);
            }
            return 0;
        }
    });

    var selectBoxOpacity = new Modifier({
        opacity: 0.2
    });

    var selectMouseSync = new MouseSync();

    var patches = 0;
    var currentPatch;

    selectMouseSync.on("start", function (data){
        anchor.set([data.clientX, data.clientY]);
        currentPatch = new Patch(patches, images[patches]);
    });

    selectMouseSync.on("update", function (data){
        size.set(data.position);
        //find overlap between cells and select box
        var cells = document.getElementsByClassName('cell');
        var selectBox = document.getElementsByClassName('selectBox')[0];
        var selectBoxRect = selectBox.getBoundingClientRect();
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            var cellRect = cell.getBoundingClientRect();
            var overlap = !(cellRect.right < selectBoxRect.left || 
                cellRect.left > selectBoxRect.right || 
                cellRect.bottom < selectBoxRect.top || 
                cellRect.top > selectBoxRect.bottom);
            if(overlap) {
                cell.style.opacity = 1;
            } else {
                cell.style.opacity = 0.5;
            }
        }
        //find min and max row and column highlighted in grid
        currentPatch.setDimensions(findMinMaxRow(), findMinMaxColumn());
        //check if patch is to be inserted
        if(currentPatch.valid()){
            //set size and position of patch
            currentPatch.addModifier();
            currentPatch.addToGrid();
            currentPatch.addImage();
        }
    });

    selectMouseSync.on("end", function (){
        //reset select box size and position
        anchor.set([0,0]);
        size.set([0,0]);
        //reset opacity of cells
        var cells = document.getElementsByClassName('cell');
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            cell.style.opacity = 0.5;
        }
        patches++;
    });

    var mainContext = Engine.createContext();

    var rows = 20;
    var columns = 20;

    var grid = new GridLayout({
        dimensions: [rows, columns]
    });

    var surfaces = [];
    grid.sequenceFrom(surfaces);

    for(var j = 0; j < rows; j++){
        for(var i = 0; i < columns; i++) {
            surfaces.push(new Surface({
                size: [undefined, undefined],
                classes: ["cell", j + 1, i + 1],
                properties: {
                    backgroundColor: "hsl(" + ((i * j) * 360 / (rows * columns)) + ", 100%, 50%)",
                    color: "black",
                    lineHeight: '100px',
                    textAlign: 'center'
                }
            }));
        }
    }

    var gridSize = new Transitionable([400, 400]);

    var gridModifier = new Modifier({
        size: function(){
            return gridSize.get();
        }, 
        origin: [.5, .5], 
        opacity: 0.5
    });

    /**
    *
    * Pan and Scale
    *
    **/

    var maxScale = 200;
    var minScale = 0;
    var displaceThreshold = 50;
    var maxDisplace = maxScale + displaceThreshold;
    var minDisplace = minScale - displaceThreshold;
    var perspective = maxDisplace + 120;

    var scale = new Transitionable(0);
    var position = new Transitionable([0, 0]);

    var scrollSync = new ScrollSync();
    var panMouseSync = new MouseSync();

    mainContext.setPerspective(perspective);

    //Dynamic positioning modifiers

    var scaleModifier = new Modifier({
        transform : function(){
            var currentScale = scale.get();
            return Transform.translate(0, 0, currentScale);
        }
    });

    var panModifier = new Modifier({
        transform: function(){
            var currentPosition = position.get();
            return Transform.translate(currentPosition[0], currentPosition[1]);
        }
    });


    //Static positioning modifiers

    var initScaleModifier = new Modifier({
        transform: Transform.translate(0, 0, displaceThreshold  + 50)
    });

    //Scaling listeners

    Engine.pipe(scrollSync);

    scrollSync.on("update", function(data) {
        var currentScale = scale.get();
        var delta = data.delta[1] /100;

        if (currentScale > maxDisplace){
            scale.set( currentScale );
        } else if (currentScale < minDisplace){
            scale.set( currentScale );
        } else {
            scale.set( currentScale + delta );
        }
    });

    scrollSync.on("end", function() {
        if(scale.get() < minScale){
            scale.set(minScale, {method : 'wall',   dampingRatio : 0.5, period : 500});
        }
        if(scale.get() > maxScale){
            scale.set(maxScale, {method : 'wall',   dampingRatio : 0.5, period : 500});
        }
    });

    //Panning listeners

    Engine.pipe(panMouseSync);

    panMouseSync.on("update", function(data){
        var currentPosition = position.get();
        position.set([
            currentPosition[0] + data.delta[0],
            currentPosition[1] + data.delta[1]
        ]);
    });

    /**
    *
    * Patches
    *
    **/

    function Patch(id, imageSrc) {
        this.surface = new Surface({
            size: [undefined, undefined],
            classes: ['patch', id],
            properties: {
                background: 'blue'
            }
        });
        this.id = id;
        this.valid = function(){
            return this.minRow && this.maxRow && this.minColumn && this.maxColumn;
        }
        this.image = imageSrc;
        this.surface.pipe(patchAdditionEvent);
    }

    var patchAdditionEvent = new EventHandler();

    patchAdditionEvent.on('deploy', function(){
        currentPatch.addImage();
    });

    Patch.prototype.addToGrid = function() {
        canvas.add(this.modifier).add(this.surface);
    };

    Patch.prototype.addImage = function() {
        $('.patch.' + this.id).backstretch(this.image);
    };

    Patch.prototype.setDimensions = function(minMaxRow, minMaxColumn){
        this.minRow = minMaxRow[0];
        this.maxRow = minMaxRow[1];
        this.minColumn = minMaxColumn[0];
        this.maxColumn = minMaxColumn[1];
    }

    Patch.prototype.addModifier = function(){
        var minRow = this.minRow;
        var maxRow = this.maxRow;
        var minColumn = this.minColumn;
        var maxColumn = this.maxColumn;
        this.modifier = new Modifier({
            size: function(){
                var currentGridSize = gridSize.get();
                var cellWidth = currentGridSize[0] / columns;
                var cellHeight = currentGridSize[1] / rows;
    
                var width = (maxColumn + 1 - minColumn) * cellWidth;
                var height = (maxRow + 1 - minRow) * cellHeight;
                return [width, height];
            },
            align: function(){
                var rowAlign = (minRow - 1) / rows;
                var columnAlign = (minColumn - 1) /columns;
    
                return [columnAlign, rowAlign];
            },
            opacity: 2
        });
    };

    function findMinMaxRow(){
        var cells = document.getElementsByClassName('cell');
        var minRow = null;
        var maxRow = null;
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            if (cell.style.opacity == 1){
                var cellClassName = cell.className;
                var id = parseInt(cellClassName.split(" ")[2]);
                if(maxRow == null || id > maxRow){
                    maxRow = id;
                }
                if (minRow == null || id < minRow){
                    minRow = id;
                }
            }
        }
        return [minRow, maxRow];
    }

    function findMinMaxColumn(){
        var cells = document.getElementsByClassName('cell');
        var minColumn = null;
        var maxColumn = null;
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            if (cell.style.opacity == 1){
                var cellClassName = cell.className;
                var stringId = (cellClassName.split(" ")[3] != undefined) ? cellClassName.split(" ")[3] : cellClassName.split(" ")[2];
                var id = parseInt(stringId);
                if(maxColumn == null || id > maxColumn){
                    maxColumn = id;
                } 
                if (minColumn == null || id < minColumn){
                    minColumn = id;
                }
            }
        }
        return [minColumn, maxColumn];
    }

    /**
    *
    * DOM addition
    *
    **/

    mainContext.add(editButtonModifier).add(editButton);
    mainContext.add(selectBoxOpacity).add(selectBoxAnchor).add(selectBoxSize).add(selectBoxRotation).add(selectBox);
    var canvas = mainContext.add(gridModifier).add(initScaleModifier).add(scaleModifier).add(panModifier);
    canvas.add(grid);
});
