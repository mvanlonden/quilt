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
        console.log(editing);
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
        classes: ["grey-bg", "selectBox"],
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
        }
    });

    var selectBoxOpacity = new Modifier({
        opacity: 0.2
    });

    var selectMouseSync = new MouseSync();

    selectMouseSync.on("start", function (data){
        anchor.set([data.clientX, data.clientY]);
    });

    selectMouseSync.on("update", function (data){
        size.set(data.position);
        minMaxRow.set(findMinMaxRow());
        minMaxColumn.set(findMinMaxColumn());
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
    });

    selectMouseSync.on("end", function (data){
        anchor.set([0,0]);
        size.set([0,0]);
        var cells = document.getElementsByClassName('cell');
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            cell.style.opacity = 0.5;
        }
    });



    var mainContext = Engine.createContext();

    var rows = 10;
    var columns =10;

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
            var currentGridSize = gridSize.get();
            return currentGridSize;
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

    var minMaxRow = new Transitionable([0, 0]);
    var minMaxColumn = new Transitionable([0, 0]);

    var testPatch = new Surface({
        size: [undefined, undefined],
        properties: {
            background: 'blue'
        }
    });

    var patchModifier = new Modifier({
        size: function(){
            console.log(minMaxRow.get());
            minMaxColumn.get();
            return [100, 100];
        },
        origin: [1, 1]
    });

    function findMinMaxRow(){
        var cells = document.getElementsByClassName('cell');
        var minRow = null;
        var maxRow = null;
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            if (cell.style.opacity == 1){
                cellClassName = cell.className;
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
                cellClassName = cell.className;
                var id = parseInt(cellClassName.split(" ")[3]);
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

    function findRowColumn() {
        var cells = document.getElementsByClassName('cell');
        var max = null;
        var min = null;
        for(var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            if (cell.style.opacity == 1) {
                cellClassName = cell.className;
                var id = parseInt(cellClassName.split(" ")[2]);
                if (max == null || id > max){
                    max = id;
                }
                if (min == null || id < min){
                    min = id;
                }
            }
        }
        return [min, max];
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
    canvas.add(patchModifier).add(testPatch);
    
});
